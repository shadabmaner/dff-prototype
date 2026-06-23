"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, ArrowLeft, Clock, Loader2, PlusCircle, Save, Zap, Calendar, LayoutGrid, Layers, X } from "lucide-react"
import { toast } from "sonner"

import type { ActionItem } from "@/components/super-admin/action-library"
import { useSuperAdmin } from "@/components/super-admin/super-admin-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useActions, useCreateAction, type ActionApi } from "@/hooks/use-actions"
import { useWorkflowProgram } from "@/hooks/use-workflow-programs"
import { useWorkflowProgramPlan } from "@/hooks/use-workflow-program-plans"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRolesDropdown } from "@/hooks/use-roles-dropdown"
import { useNotificationTemplatesDropdown } from "@/hooks/use-notification-templates"

interface ScheduledAction {
  instanceId: string
  actionId: string
  dayOffset: number
  startHour: number
  durationMinutes: number
}

const paletteColors = [
  "bg-blue-50/80 text-blue-600 border-blue-100/50",
  "bg-indigo-50/80 text-indigo-600 border-indigo-100/50",
  "bg-emerald-50/80 text-emerald-600 border-emerald-100/50",
  "bg-amber-50/80 text-amber-600 border-amber-100/50"
]
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const ACTION_DRAG_TYPE = "protocol/action"
const ENTRY_DRAG_TYPE = "protocol/entry"

const actionCategories = ["Governance", "Clinical", "Finance", "Comms"] as const
const actionStatuses = ["IDLE", "RUNNING", "FAILED", "SCHEDULED"] as const

type ActionCategory = (typeof actionCategories)[number]
type ActionStatus = (typeof actionStatuses)[number]

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

type DraftParticipant = {
  roleId: string
  roleName: string
}

type DraftNotification = {
  templateId: string
  triggerType: string
  offsetMins: string
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

export default function ProtocolSchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ protocolId: string }>()
  const protocolId = React.useMemo(() => {
    const raw = params?.protocolId
    if (Array.isArray(raw)) return raw[0]
    return raw ?? ""
  }, [params])
  const {
    specialties: { data, loading },
  } = useSuperAdmin()

  const planContext = React.useMemo(() => {
    for (const specialty of data) {
      const plan = specialty.plans.find((item) => item.protocolId === protocolId)
      if (plan) {
        return { specialty, plan }
      }
    }
    return null
  }, [data, protocolId])

  const specialityIdFromQuery = searchParams?.get("specialityId") ?? planContext?.specialty.id ?? "-"
  const programIdFromQuery = searchParams?.get("programId") ?? null
  const planIdFromQuery = searchParams?.get("planId") ?? protocolId

  const planNameFromQuery = searchParams?.get("planName") ?? planContext?.plan.name ?? protocolId
  const workflowProgramId = React.useMemo(() => {
    if (programIdFromQuery) return programIdFromQuery
    return planContext?.plan.id ?? ""
  }, [planContext?.plan.id, programIdFromQuery])
  const effectiveWorkflowProgramId = workflowProgramId || undefined

  const {
    data: workflowProgram,
    isLoading: workflowProgramLoading,
    error: workflowProgramError,
  } = useWorkflowProgram(effectiveWorkflowProgramId)
  const {
    data: selectedPlan,
    isLoading: selectedPlanLoading,
    error: selectedPlanError,
  } = useWorkflowProgramPlan(effectiveWorkflowProgramId ?? "", planIdFromQuery)
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
    if (workflowProgramError) {
      const message = workflowProgramError instanceof Error ? workflowProgramError.message : "Unable to load program"
      toast.error(message)
    }
  }, [workflowProgramError])
  React.useEffect(() => {
    if (selectedPlanError) {
      const message = selectedPlanError instanceof Error ? selectedPlanError.message : "Unable to load selected plan"
      toast.error(message)
    }
  }, [selectedPlanError])
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

  const headerProgramName = selectedPlan?.name ?? planNameFromQuery
  const headerContextName = workflowProgram?.name ?? planContext?.plan.name ?? protocolId
  //@ts-ignore
  const headerProgramCode = workflowProgram?.code ?? planContext?.plan?.code ?? protocolId.slice(0, 6).toUpperCase()
  const headerSpecialityLabel =
  //@ts-ignore
    workflowProgram?.speciality?.name ?? planContext?.specialty.name ?? workflowProgram?.speciality_id ?? specialityIdFromQuery

  const durationMeta = React.useMemo(() => {
    const rawType = (workflowProgram?.duration_type_v2 ?? workflowProgram?.duration_type ?? "days").toLowerCase()
    const normalizedType: "days" | "months" = rawType === "months" ? "months" : "days"
    const normalizedValue = Math.max(1, workflowProgram?.duration_value ?? 30)
    return { type: normalizedType, value: normalizedValue }
  }, [workflowProgram])

  const isDayDuration = durationMeta.type === "days"

  const totalScheduleDays = React.useMemo(() => {
    return durationMeta.type === "months" ? durationMeta.value * 30 : durationMeta.value
  }, [durationMeta])

  const durationPrimaryLabel = React.useMemo(() => {
    const unit = durationMeta.type === "months" ? "Month" : "Day"
    const value = durationMeta.value
    return `${value} ${value === 1 ? unit : `${unit}s`}`
  }, [durationMeta])

  const durationSecondaryLabel = React.useMemo(() => {
    if (durationMeta.type === "months") {
      return `${totalScheduleDays} ${totalScheduleDays === 1 ? "Day" : "Days"}`
    }
    const approxMonths = Math.max(1, Math.ceil(durationMeta.value / 30))
    return `${approxMonths} ${approxMonths === 1 ? "Month" : "Months"} (approx)`
  }, [durationMeta, totalScheduleDays])

  const protocolSegments = React.useMemo(() => {
    if (durationMeta.type === "months") {
      return Array.from({ length: durationMeta.value }, (_, index) => {
        const rangeStart = index * 30 + 1
        const rangeEnd = Math.min(rangeStart + 29, totalScheduleDays)
        return {
          id: `protocol-${index + 1}`,
          label: `Protocol · Month ${index + 1}`,
          rangeStart,
          rangeEnd,
        }
      })
    }

    return Array.from({ length: durationMeta.value }, (_, index) => {
      const day = index + 1
      return {
        id: `protocol-${index + 1}`,
        label: `Protocol · Day ${day}`,
        rangeStart: day,
        rangeEnd: day,
      }
    })
  }, [durationMeta, totalScheduleDays])

  const [selectedProtocolSegment, setSelectedProtocolSegment] = React.useState("")

  React.useEffect(() => {
    if (!protocolSegments.length) {
      setSelectedProtocolSegment("")
      return
    }
    setSelectedProtocolSegment((prev) => {
      if (prev && protocolSegments.some((segment) => segment.id === prev)) {
        return prev
      }
      return protocolSegments[0].id
    })
  }, [protocolSegments])

  const selectedSegment = React.useMemo(
    () => protocolSegments.find((segment) => segment.id === selectedProtocolSegment) ?? protocolSegments[0] ?? null,
    [protocolSegments, selectedProtocolSegment]
  )
  const [actions, setActions] = React.useState<ActionItem[]>([])
  const [timeline, setTimeline] = React.useState<ScheduledAction[]>([])
  const [saving, setSaving] = React.useState(false)
  const [targetDay, setTargetDay] = React.useState(1)
  const [draggedSlotKey, setDraggedSlotKey] = React.useState<string | null>(null)
  const [timelineSeeded, setTimelineSeeded] = React.useState(false)
  const paletteActions = React.useMemo(() => actions.slice(0, 6), [actions])
  const [selectedPaletteAction, setSelectedPaletteAction] = React.useState("")
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [draftAction, setDraftAction] = React.useState<DraftAction>(() => createDefaultDraft())

  const actionMap = React.useMemo(() => new Map(actions.map((item) => [item.id, item])), [actions])

  const dayHourSlots = React.useMemo(() => Array.from({ length: 10 }, (_, index) => 8 + index), [])
  const allScheduleDays = React.useMemo(() => Array.from({ length: Math.max(1, totalScheduleDays) }, (_, index) => index + 1), [totalScheduleDays])

  React.useEffect(() => {
    if (!selectedSegment) return
    setTargetDay((prev) => {
      if (prev >= selectedSegment.rangeStart && prev <= selectedSegment.rangeEnd) {
        return prev
      }
      return selectedSegment.rangeStart
    })
  }, [selectedSegment])

  const syncSegmentForDay = React.useCallback(
    (day: number) => {
      const owningSegment = protocolSegments.find((segment) => day >= segment.rangeStart && day <= segment.rangeEnd)
      if (owningSegment && owningSegment.id !== selectedProtocolSegment) {
        setSelectedProtocolSegment(owningSegment.id)
      }
    },
    [protocolSegments, selectedProtocolSegment]
  )

  const handleSelectDay = React.useCallback(
    (day: number) => {
      setTargetDay(day)
      syncSegmentForDay(day)
    },
    [syncSegmentForDay]
  )

  const selectedActionDetails = React.useMemo(
    () => (selectedPaletteAction ? actionMap.get(selectedPaletteAction) ?? null : null),
    [actionMap, selectedPaletteAction]
  )

  React.useEffect(() => {
    if (selectedActionDetails) {
      setDraftAction((prev) => ({
        ...prev,
        name: selectedActionDetails.name,
        owner: selectedActionDetails.owner,
        description: selectedActionDetails.description,
        cadence: selectedActionDetails.cadence,
        category: selectedActionDetails.category,
        autoPilot: selectedActionDetails.autoPilot,
      }))
    }
  }, [selectedActionDetails])

  const {
    data: actionsResponse,
    isLoading: actionsLoading,
    isFetching: actionsFetching,
    error: actionsError,
  } = useActions({ page: 1, limit: 100 })

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
    if (!timelineSeeded && actions?.length) {
      const dayPool = allScheduleDays
      const maxSlots = dayPool.length || 1
      setTimeline(
        actions.slice(0, Math.min(actions.length, maxSlots)).map((action, index) => ({
          instanceId: `sched-${action.id}-${index}`,
          actionId: action.id,
          dayOffset: dayPool[index % maxSlots] ?? 1,
          startHour: 9 + (index % dayHourSlots.length),
          durationMinutes: 45,
        }))
      )
      setTimelineSeeded(true)
    }
  }, [actions, timelineSeeded, allScheduleDays, dayHourSlots.length])

  React.useEffect(() => {
    if (!selectedPaletteAction && paletteActions.length) {
      setSelectedPaletteAction(paletteActions[0].id)
    }
  }, [paletteActions, selectedPaletteAction])

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

  const scheduleAction = React.useCallback(
    (actionId: string, day: number, actionOverride?: ActionItem, slotHour?: number) => {
      const action = actionOverride ?? actionMap.get(actionId)
      if (!action) return false
      setTimeline((prev) => {
        const sameDayCount = prev.filter((entry) => entry.dayOffset === day).length
        return [
          ...prev,
          {
            instanceId: `sched-${actionId}-${crypto.randomUUID()}`,
            actionId,
            dayOffset: day,
            startHour: slotHour ?? 8 + (sameDayCount % 4) * 2,
            durationMinutes: 40,
          },
        ]
      })
      toast.success(`Scheduled ${action.name} on day ${day}`)
      handleSelectDay(day)
      return true
    },
    [actionMap, handleSelectDay]
  )

  const moveScheduledAction = React.useCallback(
    (instanceId: string, day: number, slotHour?: number) => {
      setTimeline((prev) =>
        prev.map((entry) =>
          entry.instanceId === instanceId
            ? { ...entry, dayOffset: day, startHour: slotHour ?? entry.startHour }
            : entry
        )
      )
      handleSelectDay(day)
    },
    [handleSelectDay]
  )

  const handleAddAction = (action: ActionItem) => {
    scheduleAction(action.id, targetDay, action)
  }

  const handleQuickAddAction = React.useCallback(() => {
    setSelectedPaletteAction("")
    setDraftAction(createDefaultDraft())
    setDrawerOpen(true)
  }, [])

  const handleConfirmSchedule = async () => {
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
      setSelectedPaletteAction(mapped.id)
      scheduleAction(mapped.id, targetDay, mapped)
      toast.success(`Created and scheduled ${mapped.name}`)
      setDrawerOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create action"
      toast.error(message)
    }
  }

  const handleRemoveAction = (instanceId: string) => {
    setTimeline((prev) => prev.filter((item) => item.instanceId !== instanceId))
  }

  const handlePaletteDragStart = (event: React.DragEvent<HTMLDivElement>, actionId: string) => {
    event.dataTransfer.setData(ACTION_DRAG_TYPE, actionId)
    event.dataTransfer.effectAllowed = "copy"
  }

  const handleEntryDragStart = (event: React.DragEvent<HTMLDivElement>, instanceId: string) => {
    event.stopPropagation()
    event.dataTransfer.setData(ENTRY_DRAG_TYPE, instanceId)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleDayDrop = (event: React.DragEvent<HTMLDivElement>, day: number, slotHour?: number) => {
    event.preventDefault()
    setDraggedSlotKey(null)
    const actionId = event.dataTransfer.getData(ACTION_DRAG_TYPE)
    if (actionId) {
      scheduleAction(actionId, day, undefined, slotHour)
      return
    }
    const entryId = event.dataTransfer.getData(ENTRY_DRAG_TYPE)
    if (entryId) {
      moveScheduledAction(entryId, day, slotHour)
    }
  }

  const scheduledByDay = React.useMemo(() => {
    const bucket = new Map<number, ScheduledAction[]>()
    timeline.forEach((entry) => {
      if (!bucket.has(entry.dayOffset)) bucket.set(entry.dayOffset, [])
      bucket.get(entry.dayOffset)?.push(entry)
    })
    return bucket
  }, [timeline])

  const hourlyEntries = React.useMemo(() => {
    const slotMap = new Map<number, { hour: number; entries: ScheduledAction[] }>()
    dayHourSlots.forEach((hour) => slotMap.set(hour, { hour, entries: [] }))
    const entries = scheduledByDay.get(targetDay) ?? []
    entries.forEach((entry) => {
      const slotHour = dayHourSlots.find((hour) => hour === entry.startHour) ?? dayHourSlots[0]
      const bucket = slotMap.get(slotHour)
      if (bucket) bucket.entries.push(entry)
    })
    return Array.from(slotMap.values())
  }, [dayHourSlots, scheduledByDay, targetDay])

  const displayedMonthDays = React.useMemo(() => {
    if (!selectedSegment) return allScheduleDays
    if (durationMeta.type !== "months") {
      return allScheduleDays.filter((day) => day === selectedSegment.rangeStart)
    }
    return allScheduleDays.filter((day) => day >= selectedSegment.rangeStart && day <= selectedSegment.rangeEnd)
  }, [allScheduleDays, durationMeta.type, selectedSegment])

  const formatHourLabel = React.useCallback((hour: number) => {
    const normalized = ((hour % 24) + 24) % 24
    const suffix = normalized >= 12 ? "PM" : "AM"
    const display = normalized % 12 === 0 ? 12 : normalized % 12
    return `${display} ${suffix}`
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    toast.success("Protocol schedule saved")
    setSaving(false)
  }

  const protocolActionCount = timeline.length

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        <Loader2 className="h-6 w-6 animate-spin mb-4 text-primary" /> Initializing builder...
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-20 px-4 md:px-0">
        <Button variant="ghost" size="sm" className="h-11 rounded-full border border-slate-200 text-slate-600 px-5 text-[11px] font-black uppercase tracking-[0.2em]" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        <div className="rounded-[2rem] border border-slate-100 bg-white px-6 py-8 md:px-10 md:py-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.6)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-slate-400 uppercase">
              <span className="h-2 w-2 rounded-full bg-primary" /> Schedule & Calendar
            </div>
            <div>
              <h1 className="text-3xl md:text-[44px] font-black leading-none text-slate-900">
                {workflowProgramLoading || selectedPlanLoading ? (
                  <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription plan…
                  </span>
                ) : (
                  <>
                    {headerProgramName}{" "}
                    <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">Management</span>
                  </>
                )}
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-500 font-medium">
                {planContext
                  ? `Define day-by-day actions for ${headerProgramName} under ${headerContextName} and block orchestration conflicts.`
                  : `Define day-by-day actions for ${headerProgramName} under ${headerContextName}.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
             
              <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-500">
                Program Code · {headerProgramCode}
              </Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-500">
                Selected Plan · {headerProgramName}
              </Badge>
              <span>Speciality · {headerSpecialityLabel}</span>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            
            <Button size="sm" className="h-11 rounded-full bg-slate-900 text-white px-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
            </Button>
          </div>
        </div>
      </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="space-y-6 w-full md:w-[320px] lg:w-[360px] xl:w-[400px] shrink-0">
          <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
            <CardHeader className="p-6 pb-2 space-y-3">
              <div className="flex flex-col gap-3">
                <div className="flex lg:flex-col justify-between gap-3">
                  <div className="flex flex-start items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 leading-none">Action Palette</CardTitle>
                  </div>
                  <div className="flex flex-end items-end gap-2">
                    <Select value={selectedPaletteAction} onValueChange={(value) => setSelectedPaletteAction(value)}>
                      <SelectTrigger className="h-9 w-[160px] rounded-full border-slate-200 bg-white shadow-sm text-[10px] font-black uppercase tracking-[0.2em]">
                        <SelectValue placeholder="Choose action" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                        {actions.map((action) => (
                          <SelectItem key={action.id} value={action.id} className="text-[10px] font-black uppercase tracking-widest">
                            {action.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-9 cursor-pointer rounded-full bg-primary text-white px-4 text-[10px] font-black uppercase tracking-[0.2em]" onClick={handleQuickAddAction}>
                      <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Drag actions or use quick add to queue automation triggers.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                {actionsLoading || actionsFetching ? (
                  <div className="flex h-40 items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Syncing action palette…
                  </div>
                ) : paletteActions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    No actions available yet.
                  </div>
                ) : (
                  paletteActions.map((action, index) => (
                    <div
                      key={action.id}
                      className={cn(
                        "group cursor-grab active:cursor-grabbing rounded-2xl p-4 transition-all duration-300 border shadow-sm hover:shadow-md hover:-translate-y-0.5",
                        paletteColors[index % paletteColors.length]
                      )}
                      draggable
                      onDragStart={(event) => handlePaletteDragStart(event, action.id)}
                      onDragEnd={() => setDraggedSlotKey(null)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-black uppercase tracking-tight">{action.name}</p>
                        <Zap className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 truncate">{action.owner}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-medium leading-tight opacity-80 line-clamp-2 pr-4">{action.description}</p>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-white/50 shrink-0" onClick={() => handleAddAction(action)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-slate-50/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scheduled Actions</p>
                <p className="text-3xl font-black text-slate-900 tabular-nums">{timeline.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary">
                <LayoutGrid className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
          <Card className="fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex-1">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-8 border-b border-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Protocol Sequence</CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Anchor points for automated orchestration.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedProtocolSegment} onValueChange={setSelectedProtocolSegment} disabled={!protocolSegments.length}>
                <SelectTrigger className="h-10 w-48 rounded-xl border-slate-100 bg-slate-50 shadow-sm text-[10px] font-black uppercase tracking-widest">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  {protocolSegments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id} className="text-[10px] font-black uppercase tracking-widest">
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {isDayDuration ? (
              <div className="space-y-3">
                {hourlyEntries.map(({ hour, entries }) => {
                  const slotKey = `hour-${hour}`
                  const isSelected = targetDay === hour
                  const isDragTarget = draggedSlotKey === slotKey
                  return (
                    <div
                      key={slotKey}
                      onClick={() => handleSelectDay(hour)}
                      onDragEnter={(event) => {
                        event.preventDefault()
                        setDraggedSlotKey(slotKey)
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDayDrop(event, hour, hour)}
                      onDragLeave={(event) => {
                        event.preventDefault()
                        setDraggedSlotKey((prev) => (prev === slotKey ? null : prev))
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 cursor-pointer",
                        isSelected || isDragTarget
                          ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("text-sm font-black tracking-widest", isSelected ? "text-primary" : "text-slate-500")}>{formatHourLabel(hour)}</div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex flex-wrap gap-2">
                          {entries.map((entry) => {
                            const action = actionMap.get(entry.actionId)
                            if (!action) return null
                            return (
                              <div
                                key={entry.instanceId}
                                className="group/entry relative rounded-xl border border-slate-100 bg-slate-50 px-3 py-1 shadow-sm text-[10px] font-black uppercase tracking-tight"
                                draggable
                                onDragStart={(event) => handleEntryDragStart(event, entry.instanceId)}
                                onDragEnd={() => setDraggedSlotKey(null)}
                              >
                                {action.name}
                                <button
                                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-slate-200 text-[9px] text-slate-600 hover:bg-rose-100 hover:text-rose-600"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleRemoveAction(entry.instanceId)
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <Clock className="h-4 w-4 text-slate-300" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {weekdays.map((day) => (
                    <div key={day} className="text-center">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {displayedMonthDays.map((day) => {
                    const entries = scheduledByDay.get(day) ?? []
                    const isSelected = targetDay === day
                    const isDragTarget = draggedSlotKey === `day-${day}`
                    return (
                      <div
                        key={day}
                        onClick={() => handleSelectDay(day)}
                        onDragEnter={(event) => {
                          event.preventDefault()
                          setDraggedSlotKey(`day-${day}`)
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDayDrop(event, day)}
                        onDragLeave={(event) => {
                          event.preventDefault()
                          setDraggedSlotKey((prev) => (prev === `day-${day}` ? null : prev))
                        }}
                        className={cn(
                          "group relative min-h-[90px] rounded-2xl border p-2 text-left transition-all duration-300 cursor-pointer overflow-hidden",
                          isSelected || isDragTarget
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-inner"
                            : "border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn("text-[10px] font-black tracking-widest", isSelected ? "text-primary" : "text-slate-400")}>{day}</div>
                        <div className="mt-2 space-y-1.5 relative z-10">
                          {entries.map((entry) => {
                            const action = actionMap.get(entry.actionId)
                            if (!action) return null
                            return (
                              <div
                                key={entry.instanceId}
                                className="group/entry relative rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                                draggable
                                onDragStart={(event) => handleEntryDragStart(event, entry.instanceId)}
                                onDragEnd={() => setDraggedSlotKey(null)}
                              >
                                <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-1 pr-3">{action.name}</p>
                                <div className="flex items-center gap-1 opacity-60">
                                  <Clock className="h-2.5 w-2.5" />
                                  <p className="text-[8px] font-bold uppercase tracking-widest">{entry.startHour}:00</p>
                                </div>
                                <button
                                  className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleRemoveAction(entry.instanceId)
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Program Duration</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{durationPrimaryLabel}</p>
                <p className="text-xs font-semibold text-slate-500">{durationSecondaryLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Protocol Actions</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{protocolActionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) {
            setDraftAction(createDefaultDraft())
          }
        }}
        direction="right"
      >
        <DrawerContent className="h-full min-w-lg max-w-4xl overflow-y-auto border-l bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 sm:max-w-4xl">
          <DrawerHeader className="gap-3 border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
              <Layers className="h-4 w-4 text-primary" /> Create Action
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {draftAction.name || "New automation"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Define action properties before adding it to the schedule. This will be saved to the API.
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
                        <Input
                          value={participant.roleName}
                          onChange={(event) => updateParticipant("initiators", index, "roleName", event.target.value)}
                          placeholder="Role label (optional override)"
                        />
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
                        <Input
                          value={participant.roleName}
                          onChange={(event) => updateParticipant("respondents", index, "roleName", event.target.value)}
                          placeholder="Role label (optional override)"
                        />
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full border-slate-200 text-[10px] font-black uppercase tracking-[0.35em]"
                    onClick={addNotificationRow}
                  >
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
                      <div
                        key={`notification-${index}`}
                        className="rounded-[2rem] border border-slate-100 bg-white/80 p-5 shadow-[0_20px_40px_-25px_rgba(15,23,42,0.4)] space-y-4"
                      >
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
                                <SelectValue
                                  placeholder={
                                    notificationTemplatesLoading ? "Loading templates..." : "Select notification template"
                                  }
                                />
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
            <Button variant="ghost" className="rounded-full" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" disabled={createActionMutation.isPending || !draftAction.name.trim()} onClick={handleConfirmSchedule}>
              {createActionMutation.isPending ? "Creating..." : `Create & schedule (Day ${targetDay})`}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
