"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  Play,
  Zap,
  RefreshCcw,
  ShieldCheck,
  Plus,
  PlusCircle,
  SlidersHorizontal,
  Search,
  Loader2,
  Activity,
  User,
  Clock,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useActions, useCreateAction, type ActionApi } from "@/hooks/use-actions"
import { useRolesDropdown } from "@/hooks/use-roles-dropdown"
import { useNotificationTemplatesDropdown } from "@/hooks/use-notification-templates"

const actionCategories = ["Governance", "Clinical", "Finance", "Comms"] as const
const actionStatuses = ["IDLE", "RUNNING", "FAILED", "SCHEDULED"] as const

type ActionCategory = (typeof actionCategories)[number]
type ActionStatus = (typeof actionStatuses)[number]

const normalizeCategory = (value?: string | null): ActionCategory => {
  if (!value) return "Governance"
  const match = actionCategories.find((category) => category.toLowerCase() === value.toLowerCase())
  return match ?? "Governance"
}

const normalizeStatus = (value?: string | null): ActionStatus => {
  if (!value) return "IDLE"
  const upper = value.toUpperCase()
  const match = actionStatuses.find((status) => status === upper)
  return match ?? "IDLE"
}

const mapActionFromApi = (action: ActionApi): ActionItem => {
  const category = normalizeCategory(action.category_name ?? action.category?.name)
  const status = normalizeStatus(action.status)
  const owner = action.owner_name ?? action.initiators?.[0]?.role_name ?? "Orchestration Ops"
  const cadence = action.cadence ?? (action.default_duration_mins ? `${action.default_duration_mins} mins` : "Manual")
  const lastRun = action.last_run_at ?? action.updated_at ?? "-"
  const impactSource = action.default_duration_mins ?? 60
  const impactScore = Math.min(95, Math.max(50, impactSource))

  return {
    id: action.id ?? crypto.randomUUID(),
    name: action.name ?? "Untitled Action",
    category,
    owner,
    description: action.description ?? "No description provided.",
    cadence,
    lastRun,
    status,
    autoPilot: Boolean(action.is_active),
    impactScore,
  }
}

type ActionItem = {
  id: string
  name: string
  category: ActionCategory
  owner: string
  description: string
  cadence: string
  lastRun: string
  status: ActionStatus
  autoPilot: boolean
  impactScore: number
}

type DraftParticipant = {
  roleId: string
  roleName: string
}

type DraftNotification = {
  templateId: string
  triggerType: string
  offsetMins: string
}

type DraftAction = {
  name: string
  code: string
  owner: string
  description: string
  cadence: string
  category: ActionCategory
  categoryId: string
  defaultDurationMins: string
  autoPilot: boolean
  initiators: DraftParticipant[]
  respondents: DraftParticipant[]
  notifications: DraftNotification[]
}

const createDefaultDraft = (): DraftAction => ({
  name: "",
  code: "",
  owner: "",
  description: "",
  cadence: "Manual",
  category: actionCategories[0],
  categoryId: "",
  defaultDurationMins: "",
  autoPilot: false,
  initiators: [],
  respondents: [],
  notifications: [],
})

const initialActions: ActionItem[] = [
  {
    id: "act-101",
    name: "Deactivate Expired Trials",
    category: "Governance",
    owner: "Platform Ops",
    description: "Identify accounts with lapsed agreements and downgrade privileges.",
    cadence: "Daily 08:00",
    lastRun: "2026-02-26T23:00:00Z",
    status: "SCHEDULED",
    autoPilot: true,
    impactScore: 86,
  },
  {
    id: "act-204",
    name: "Nudge Inactive Clinicians",
    category: "Clinical",
    owner: "Clinical Ops",
    description: "Trigger in-app prompts for clinicians without consults for 14 days.",
    cadence: "Manual",
    lastRun: "2026-02-25T10:40:00Z",
    status: "IDLE",
    autoPilot: false,
    impactScore: 72,
  },
  {
    id: "act-310",
    name: "Reconcile High-Value Refunds",
    category: "Finance",
    owner: "Finance PMO",
    description: "Moves flagged refunds into dual-approval workflow.",
    cadence: "Hourly",
    lastRun: "2026-02-27T18:05:00Z",
    status: "RUNNING",
    autoPilot: true,
    impactScore: 91,
  },
  {
    id: "act-411",
    name: "Broadcast SOP Updates",
    category: "Comms",
    owner: "Enablement",
    description: "Pushes multilingual alerts when SOP documents change.",
    cadence: "On demand",
    lastRun: "2026-02-22T05:15:00Z",
    status: "FAILED",
    autoPilot: false,
    impactScore: 64,
  },
]

export default function ActionPalettePage() {
  const [actions, setActions] = React.useState<ActionItem[]>(initialActions)
  const [filters, setFilters] = React.useState({ query: "", category: "ALL", status: "ALL" })
  const [selectedAction, setSelectedAction] = React.useState<ActionItem | null>(null)
  const [createDrawerOpen, setCreateDrawerOpen] = React.useState(false)
  const [draftAction, setDraftAction] = React.useState<DraftAction>(() => createDefaultDraft())
  const [runConfirm, setRunConfirm] = React.useState<ActionItem | null>(null)

  const {
    data: actionsResponse,
    isLoading: actionsLoading,
    isFetching: actionsFetching,
    error: actionsError,
  } = useActions({ page: 1, limit: 100, query: filters.query || undefined })
  const {
    data: roleOptions = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useRolesDropdown()
  const {
    data: notificationTemplateOptions = [],
    isLoading: notificationTemplatesLoading,
    error: notificationTemplatesError,
  } = useNotificationTemplatesDropdown()

  React.useEffect(() => {
    if (actionsResponse?.items) {
      setActions(actionsResponse.items.map(mapActionFromApi))
    }
  }, [actionsResponse])

  React.useEffect(() => {
    if (actionsError) {
      const message = (actionsError as Error)?.message ?? "Unable to load actions"
      toast.error(message)
    }
  }, [actionsError])
  React.useEffect(() => {
    if (rolesError) {
      const message = rolesError instanceof Error ? rolesError.message : "Unable to load roles"
      toast.error(message)
    }
  }, [rolesError])
  React.useEffect(() => {
    if (notificationTemplatesError) {
      const message =
        notificationTemplatesError instanceof Error ? notificationTemplatesError.message : "Unable to load templates"
      toast.error(message)
    }
  }, [notificationTemplatesError])

  const createActionMutation = useCreateAction()

  const updateParticipant = (
    type: "initiators" | "respondents",
    index: number,
    field: keyof DraftParticipant,
    value: string
  ) => {
    setDraftAction((prev) => {
      const next = [...prev[type]]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, [type]: next }
    })
  }

  const addParticipantRow = (type: "initiators" | "respondents") => {
    setDraftAction((prev) => ({
      ...prev,
      [type]: [...prev[type], { roleId: "", roleName: "" }],
    }))
  }

  const removeParticipantRow = (type: "initiators" | "respondents", index: number) => {
    setDraftAction((prev) => {
      const next = [...prev[type]]
      next.splice(index, 1)
      return { ...prev, [type]: next }
    })
  }

  const updateNotification = (index: number, field: keyof DraftNotification, value: string) => {
    setDraftAction((prev) => {
      const next = [...prev.notifications]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, notifications: next }
    })
  }

  const addNotificationRow = () => {
    setDraftAction((prev) => ({
      ...prev,
      notifications: [...prev.notifications, { templateId: "", triggerType: "before", offsetMins: "" }],
    }))
  }

  const removeNotificationRow = (index: number) => {
    setDraftAction((prev) => {
      const next = [...prev.notifications]
      next.splice(index, 1)
      return { ...prev, notifications: next }
    })
  }

  const filtered = useMemo(() => {
    return actions.filter((action) => {
      const matchesQuery = filters.query
        ? action.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        action.description.toLowerCase().includes(filters.query.toLowerCase())
        : true
      const matchesCategory =
        filters.category === "ALL" ? true : action.category === (filters.category as ActionCategory)
      const matchesStatus = filters.status === "ALL" ? true : action.status === (filters.status as ActionStatus)
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [actions, filters])

  const summary = useMemo(() => {
    const automationCoverage = Math.round(
      (actions.filter((action) => action.autoPilot).length / actions.length) * 100
    )
    const running = actions.filter((action) => action.status === "RUNNING").length
    const failed = actions.filter((action) => action.status === "FAILED").length
    return { automationCoverage, running, failed }
  }, [actions])

  const runAction = async (action: ActionItem) => {
    toast.info(`Action ${action.name} queued`)
    setActions((prev) =>
      prev.map((item) => (item.id === action.id ? { ...item, status: "RUNNING", lastRun: new Date().toISOString() } : item))
    )
    setRunConfirm(null)
  }

  const toggleAutoPilot = (id: string, checked: boolean) => {
    setActions((prev) => prev.map((action) => (action.id === id ? { ...action, autoPilot: checked } : action)))
    toast.success(checked ? "Autopilot enabled" : "Autopilot disabled")
  }

  const handleOpenCreateDrawer = () => {
    setDraftAction(createDefaultDraft())
    setCreateDrawerOpen(true)
  }

  const handleSubmitCreateAction = async () => {
    if (!draftAction.name.trim()) {
      toast.error("Give the action a name before publishing")
      return
    }

    try {
      const payload = {
        name: draftAction.name,
        code: draftAction.code || undefined,
        description: draftAction.description,
        cadence: draftAction.cadence,
        default_duration_mins: draftAction.defaultDurationMins ? Number(draftAction.defaultDurationMins) : undefined,
        owner_name: draftAction.owner,
        is_active: draftAction.autoPilot,
        category_name: draftAction.category,
        category_id: draftAction.categoryId || undefined,
        initiators: draftAction.initiators
          .filter((participant) => participant.roleId.trim())
          .map((participant) => ({
            role_id: participant.roleId,
            role_name: participant.roleName || undefined,
          })),
        respondents: draftAction.respondents
          .filter((participant) => participant.roleId.trim())
          .map((participant) => ({
            role_id: participant.roleId,
            role_name: participant.roleName || undefined,
          })),
        notifications: draftAction.notifications
          .filter((notification) => notification.templateId.trim())
          .map((notification) => ({
            notification_template_id: notification.templateId,
            trigger_type: notification.triggerType || "before",
            trigger_offset_mins: notification.offsetMins ? Number(notification.offsetMins) : 0,
          })),
      }

      const created = await createActionMutation.mutateAsync(payload)
      const mapped = mapActionFromApi(created)
      setActions((prev) => [mapped, ...prev])
      toast.success(`Created ${mapped.name}`)
      setCreateDrawerOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create action"
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Super Admin / Action Palette</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Action Palette</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage automated actions, workflows, and platform-wide orchestration tasks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setFilters({ query: "", status: "ALL", category: "ALL" })}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg" onClick={handleOpenCreateDrawer}>
              <Plus className="mr-2 h-4 w-4" /> New Action
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Actions" value={actions.length.toString()} icon={SlidersHorizontal} color="text-blue-600" bg="from-blue-50 to-indigo-50" />
        <MetricCard label="Automation" value={`${summary.automationCoverage}%`} icon={Zap} color="text-purple-600" bg="from-purple-50 to-violet-50" />
        <MetricCard label="Running Now" value={summary.running.toString()} icon={Activity} color="text-emerald-600" bg="from-emerald-50 to-teal-50" />
        <MetricCard label="Failures" value={summary.failed.toString()} icon={ShieldCheck} color="text-rose-600" bg="from-rose-50 to-pink-50" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search actions..."
            className="pl-11 h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="h-12 w-[160px] rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
                {(["ALL", "Governance", "Clinical", "Finance", "Comms"] as const).map((item) => (
                  <SelectItem key={item} value={item} className="rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger className="h-12 w-[160px] rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                {(["ALL", "IDLE", "RUNNING", "FAILED", "SCHEDULED"] as const).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </div>

      {/* Actions Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Actions</h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100/50">
                <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[30%]">Action Blueprint</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Ownership</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Execution Schedule</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Registry</TableHead>
                <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionsLoading || actionsFetching ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-14 text-center text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Synchronizing action library…
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-slate-50/20">
                    No matching orchestration signals found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((action) => (
                  <TableRow key={action.id} className="group/row border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedAction(action)}>
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover/row:bg-primary group-hover/row:text-white transition-all duration-300">
                          {getCategoryIcon(action.category)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 uppercase tracking-tight text-[14px]">{action.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{action.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-indigo-500" />
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{action.owner}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{action.cadence}</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">{action.lastRun === "-" ? "PRE-FLIGHT" : new Date(action.lastRun).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={action.status} />
                    </TableCell>
                    <TableCell className="text-right pr-10" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">Autopilot</span>
                          <Switch
                            checked={action.autoPilot}
                            onCheckedChange={(checked) => toggleAutoPilot(action.id, checked)}
                            className="scale-75"
                          />
                        </div>
                        <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm" onClick={() => setRunConfirm(action)}>
                          <Play className="mr-2 h-3.5 w-3.5" /> Launch
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>

      {/* Drawer and Dialogs remain mostly functionally same but with UI tweaks in components */}
      <Drawer
        open={!!selectedAction}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null)
        }}
      >
        <DrawerContent className="rounded-t-[2.5rem] border-white/10">
          <DrawerHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                {selectedAction?.category}
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border-slate-200">
                ACT-{selectedAction?.id}
              </Badge>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedAction?.name}</h2>
            <p className="text-slate-500 font-medium max-w-2xl mt-2">{selectedAction?.description}</p>
          </DrawerHeader>
          {selectedAction && (
            <div className="grid gap-6 p-8 md:grid-cols-2">
              <Card className="fresh-card-alt border-none shadow-sm rounded-3xl bg-slate-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Blueprint Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <InfoRow label="Orchestration Owner" value={selectedAction.owner} />
                  <InfoRow label="Execution Cadence" value={selectedAction.cadence} />
                  <InfoRow label="Recent Cycle" value={selectedAction.lastRun === "-" ? "Initialized" : new Date(selectedAction.lastRun).toLocaleString()} />
                </CardContent>
              </Card>
              <Card className="fresh-card-alt border-none shadow-sm rounded-3xl bg-slate-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Automation Shield</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Autopilot Mode</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Autonomous Execution</p>
                    </div>
                    <Switch
                      checked={selectedAction.autoPilot}
                      onCheckedChange={(checked) => toggleAutoPilot(selectedAction.id, checked)}
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 space-y-3">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Impact Score</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Downstream critical path index</p>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${selectedAction.impactScore}%` }} />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase text-right">{selectedAction.impactScore}% SHIFT</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DrawerFooter className="p-8 pt-0 flex-row justify-end gap-3">
            <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest" onClick={() => setSelectedAction(null)}>
              Dismiss hub
            </Button>
            {selectedAction && (
              <Button className="h-12 px-10 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all" onClick={() => setRunConfirm(selectedAction)}>
                <Play className="mr-2 h-4 w-4" /> Deploy Action
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={createDrawerOpen} onOpenChange={setCreateDrawerOpen} direction="right">
        <DrawerContent className="h-full min-w-lg max-w-4xl overflow-y-auto border-l bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 sm:max-w-4xl">
          <DrawerHeader className="gap-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
              <PlusCircle className="h-4 w-4 text-primary" /> New Automation
            </div>
            <h3 className="text-2xl font-black text-slate-900">{draftAction.name || "Untitled automation"}</h3>
            <p className="text-xs text-slate-500 font-semibold">
              This drawer mirrors the protocol schedule form so new actions are API-ready.
            </p>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Core metadata</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Action name</Label>
                    <Input value={draftAction.name} onChange={(event) => setDraftAction((prev) => ({ ...prev, name: event.target.value }))} placeholder="e.g. Activate Outreach Cadence" />
                  </div>
                  <div className="space-y-2">
                    <Label>Action code</Label>
                    <Input value={draftAction.code} onChange={(event) => setDraftAction((prev) => ({ ...prev, code: event.target.value }))} placeholder="Optional e.g. DR-CALL" />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <Input value={draftAction.owner} onChange={(event) => setDraftAction((prev) => ({ ...prev, owner: event.target.value }))} placeholder="Automation Owner" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={draftAction.category}
                      onValueChange={(value) =>
                        setDraftAction((prev) => ({ ...prev, category: value as ActionCategory }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category ID (optional)</Label>
                    <Input value={draftAction.categoryId} onChange={(event) => setDraftAction((prev) => ({ ...prev, categoryId: event.target.value }))} placeholder="uuid-of-action-category" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cadence</Label>
                    <Input value={draftAction.cadence} onChange={(event) => setDraftAction((prev) => ({ ...prev, cadence: event.target.value }))} placeholder="Manual / Daily 08:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default duration (mins)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draftAction.defaultDurationMins}
                      onChange={(event) => setDraftAction((prev) => ({ ...prev, defaultDurationMins: event.target.value }))}
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Description</Label>
                <Textarea value={draftAction.description} onChange={(event) => setDraftAction((prev) => ({ ...prev, description: event.target.value }))} placeholder="Describe what this automation accomplishes" className="min-h-[120px]" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Autopilot</p>
                    <p className="text-xs text-slate-500">Match API is_active flag.</p>
                  </div>
                  <Switch checked={draftAction.autoPilot} onCheckedChange={(checked) => setDraftAction((prev) => ({ ...prev, autoPilot: checked }))} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initiators</Label>
                  <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest" onClick={() => addParticipantRow("initiators")}>
                    <PlusCircle className="mr-2 h-3 w-3" /> Add initiator
                  </Button>
                </div>
                <div className="space-y-3">
                  {draftAction.initiators.length === 0 && (
                    <p className="text-xs text-slate-500">No initiators configured.</p>
                  )}
                  {draftAction.initiators.map((participant, index) => (
                    <div key={`initiator-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Initiator #{index + 1}</p>
                        <Button variant="ghost" size="icon" onClick={() => removeParticipantRow("initiators", index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Select
                          value={participant.roleId}
                          onValueChange={(value) => {
                            updateParticipant("initiators", index, "roleId", value)
                            const selected = roleOptions.find((option) => option.id === value)
                            if (selected) {
                              updateParticipant("initiators", index, "roleName", selected.label)
                            }
                          }}
                          disabled={rolesLoading || roleOptions.length === 0}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm font-semibold">
                            <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100">
                            {roleOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id} className="text-[12px] font-medium">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input value={participant.roleName} onChange={(event) => updateParticipant("initiators", index, "roleName", event.target.value)} placeholder="role name" />
                      </div>
                      {!rolesLoading && roleOptions.length === 0 && (
                        <p className="text-[11px] text-amber-600 font-semibold">No roles available. Add roles in the admin console.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Respondents</Label>
                  <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest" onClick={() => addParticipantRow("respondents")}>
                    <PlusCircle className="mr-2 h-3 w-3" /> Add respondent
                  </Button>
                </div>
                <div className="space-y-3">
                  {draftAction.respondents.length === 0 && (
                    <p className="text-xs text-slate-500">No respondents configured.</p>
                  )}
                  {draftAction.respondents.map((participant, index) => (
                    <div key={`respondent-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Respondent #{index + 1}</p>
                        <Button variant="ghost" size="icon" onClick={() => removeParticipantRow("respondents", index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Select
                          value={participant.roleId}
                          onValueChange={(value) => {
                            updateParticipant("respondents", index, "roleId", value)
                            const selected = roleOptions.find((option) => option.id === value)
                            if (selected) {
                              updateParticipant("respondents", index, "roleName", selected.label)
                            }
                          }}
                          disabled={rolesLoading || roleOptions.length === 0}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm font-semibold">
                            <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100">
                            {roleOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id} className="text-[12px] font-medium">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input value={participant.roleName} onChange={(event) => updateParticipant("respondents", index, "roleName", event.target.value)} placeholder="role name" />
                      </div>
                      {!rolesLoading && roleOptions.length === 0 && (
                        <p className="text-[11px] text-amber-600 font-semibold">No roles available. Add roles in the admin console.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-400">Notifications</Label>
                  <Button size="sm" variant="outline" className="h-8 rounded-full border-slate-200 text-[10px] font-black uppercase tracking-[0.35em]" onClick={addNotificationRow}>
                    <PlusCircle className="mr-2 h-3 w-3" /> Add notification
                  </Button>
                </div>
                <div className="space-y-4">
                  {draftAction.notifications.length === 0 && (
                    <p className="text-xs text-slate-500">No notifications configured.</p>
                  )}
                  {draftAction.notifications.map((notification, index) => {
                    const selectedTemplate = notification.templateId
                      ? notificationTemplateOptions.find((option) => option.id === notification.templateId)
                      : null
                    const templateMeta = [selectedTemplate?.channel, selectedTemplate?.locale]
                      .filter(Boolean)
                      .join(" · ")

                    return (
                      <div key={`notification-${index}`} className="rounded-[2rem] border border-slate-100 bg-white/80 p-5 shadow-[0_20px_40px_-25px_rgba(15,23,42,0.4)] space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                              Notification #{index + 1}
                            </span>
                            {templateMeta && (
                              <Badge className="rounded-full bg-slate-100 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {templateMeta}
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => removeNotificationRow(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                          <div className="space-y-1.5">
                            <Select
                              value={notification.templateId}
                              onValueChange={(value) => updateNotification(index, "templateId", value)}
                              disabled={notificationTemplatesLoading || notificationTemplateOptions.length === 0}
                            >
                              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/90 text-left text-sm font-semibold text-slate-900 shadow-sm">
                                <SelectValue placeholder={notificationTemplatesLoading ? "Loading templates..." : "Select notification template"} />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-slate-100">
                                {notificationTemplateOptions.map((option) => (
                                  <SelectItem key={option.id} value={option.id} className="text-[12px] font-semibold">
                                    <div className="flex flex-col">
                                      <span>{option.label}</span>
                                      {(option.channel || option.locale) && (
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                          {[option.channel, option.locale]?.filter(Boolean).join(" · ")}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedTemplate && (
                              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                                {templateMeta || "Template metadata"}
                              </p>
                            )}
                          </div>
                          <Select value={notification.triggerType} onValueChange={(value) => updateNotification(index, "triggerType", value)}>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/90 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                              <SelectValue placeholder="Trigger" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 text-sm font-semibold">
                              <SelectItem value="before">Before</SelectItem>
                              <SelectItem value="after">After</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={notification.offsetMins}
                            onChange={(event) => updateNotification(index, "offsetMins", event.target.value)}
                            placeholder="Offset mins"
                            className="h-12 rounded-2xl border-slate-200 bg-white/90 text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        {!notificationTemplatesLoading && notificationTemplateOptions.length === 0 && (
                          <p className="text-[11px] text-amber-600 font-semibold">
                            No templates available. Create templates in the notification center.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t border-slate-100 bg-white/80">
            <Button variant="ghost" className="rounded-full" onClick={() => setCreateDrawerOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" disabled={createActionMutation.isPending || !draftAction.name.trim()} onClick={handleSubmitCreateAction}>
              {createActionMutation.isPending ? "Creating..." : "Create automation"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={!!runConfirm}
        onOpenChange={(open) => {
          if (!open) setRunConfirm(null)
        }}
      >
        <DialogContent className="rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100 shadow-inner">
              <Zap className="h-8 w-8 animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Launch Operation?</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
              Executing {runConfirm?.name} across production lane.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 pt-6">
            <Button className="w-full h-12 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]" onClick={() => runConfirm && runAction(runConfirm)}>
              Deploy Now
            </Button>
            <Button variant="ghost" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={() => setRunConfirm(null)}>
              Abort Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}) {
  return (
    <Card className={`border-0 bg-gradient-to-br ${bg} shadow-lg hover:shadow-xl transition-shadow overflow-hidden group`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-3 w-3 ${color}`} />
              <p className={`text-[10px] uppercase tracking-[0.15em] ${color} font-semibold`}>{label}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${bg.replace('from-', 'from-').replace('to-', 'to-')} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform opacity-80`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const mapping: Record<ActionStatus, { bg: string, text: string, ping: string }> = {
    IDLE: { bg: "bg-slate-100", text: "text-slate-600", ping: "" },
    RUNNING: { bg: "bg-emerald-500/10", text: "text-emerald-600", ping: "bg-emerald-500" },
    FAILED: { bg: "bg-rose-500/10", text: "text-rose-600", ping: "bg-rose-500" },
    SCHEDULED: { bg: "bg-blue-500/10", text: "text-blue-600", ping: "bg-blue-500" },
  }
  const config = mapping[status]
  return (
    <Badge className={cn("rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm border-none gap-2", config.bg, config.text)}>
      {config.ping && <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.ping)} />}
      {status}
    </Badge>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</p>
        <p className="text-[13px] font-black text-slate-800 uppercase tracking-wider mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function getCategoryIcon(category: ActionCategory) {
  switch (category) {
    case "Governance": return <ShieldCheck className="h-6 w-6" />
    case "Clinical": return <Zap className="h-6 w-6" />
    case "Finance": return <SlidersHorizontal className="h-6 w-6" />
    case "Comms": return <RefreshCcw className="h-6 w-6" />
  }
}
