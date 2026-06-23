"use client"

import React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Clock,
  Code,
  Calendar,
  Settings2,
  Pencil,
  MoreVertical,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Layers,
  LayoutGrid,
  PlusCircle,
  Zap,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProtocol, useUpdateProtocol, useDeleteProtocol, type Protocol } from "@/hooks/use-protocols"
import { useActions, useCreateAction, type ActionApi } from "@/hooks/use-actions"
import { useBulkUpdateProtocolActions } from "@/hooks/use-protocol-actions"
import type { ActionItem } from "@/components/super-admin/action-library"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

interface DraftProtocol {
  name: string
  code: string
  description: string
  duration_type: string
  duration_value: string
  duration_extra_days: string
  status: string
}

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

export default function ProtocolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const specialityId = params.id as string
  const programId = params.programId as string
  const protocolId = params.protocolId as string
  const programName = searchParams.get("programName") || "Workflow Program"
  const specialityName = searchParams.get("specialityName") || "Speciality"

  const { data: protocol, isLoading, isError } = useProtocol(protocolId)
  const updateMutation = useUpdateProtocol()
  const deleteMutation = useDeleteProtocol()
  const bulkUpdateProtocolActions = useBulkUpdateProtocolActions()

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [draftProtocol, setDraftProtocol] = React.useState<DraftProtocol>({
    name: "",
    code: "",
    description: "",
    duration_type: "months",
    duration_value: "",
    duration_extra_days: "0",
    status: "draft",
  })

  // Action palette and schedule state
  const [actions, setActions] = React.useState<ActionItem[]>([])
  const [timeline, setTimeline] = React.useState<ScheduledAction[]>([])
  const [targetDay, setTargetDay] = React.useState(1)
  const [draggedSlotKey, setDraggedSlotKey] = React.useState<string | null>(null)
  const [selectedPaletteAction, setSelectedPaletteAction] = React.useState("")
  const [timelineSeeded, setTimelineSeeded] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState(1)

  const paletteActions = React.useMemo(() => actions.slice(0, 6), [actions])
  const actionMap = React.useMemo(() => new Map(actions.map((item) => [item.id, item])), [actions])

  // Fetch actions
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

  // Calculate schedule days based on protocol duration
  const totalScheduleDays = React.useMemo(() => {
    if (!protocol) return 30
    return protocol.duration_type === "months" ? protocol.duration_value * 30 : protocol.duration_value
  }, [protocol])

  const allScheduleDays = React.useMemo(
    () => Array.from({ length: Math.max(1, totalScheduleDays) }, (_, index) => index + 1),
    [totalScheduleDays]
  )

  const isDayDuration = protocol?.duration_type === "days"
  const isMonthDuration = protocol?.duration_type === "months"
  const monthLength = 30
  const monthCount = isMonthDuration ? Math.max(1, protocol?.duration_value ?? 1) : 0

  React.useEffect(() => {
    if (!isMonthDuration) {
      setSelectedMonth(1)
      return
    }
    const inferredMonth = Math.min(
      Math.max(1, Math.ceil(targetDay / monthLength) || 1),
      monthCount || 1,
    )
    setSelectedMonth(inferredMonth)
  }, [isMonthDuration, monthCount, monthLength, targetDay])

  React.useEffect(() => {
    if (!isMonthDuration) return
    const maxDay = (monthCount || 1) * monthLength
    if (targetDay > maxDay) {
      setTargetDay(maxDay)
    } else if (targetDay < 1) {
      setTargetDay(1)
    }
  }, [isMonthDuration, monthCount, monthLength, targetDay])

  const monthOptions = React.useMemo(() => {
    if (!isMonthDuration) return []
    return Array.from({ length: monthCount || 1 }, (_, index) => index + 1)
  }, [isMonthDuration, monthCount])

  const dayCells = React.useMemo(
    () => {
      if (isMonthDuration) {
        const start = (selectedMonth - 1) * monthLength + 1
        return Array.from({ length: monthLength }, (_, index) => ({ label: index + 1, value: start + index }))
      }
      return allScheduleDays.map((day) => ({ label: day, value: day }))
    },
    [allScheduleDays, isMonthDuration, monthLength, selectedMonth],
  )

  const selectedMonthSummary = React.useMemo(() => {
    if (!isMonthDuration) return null
    const start = (selectedMonth - 1) * monthLength + 1
    const end = start + monthLength - 1
    return `Protocol ${selectedMonth} of ${monthCount || 1} • Days ${start}-${end}`
  }, [isMonthDuration, monthCount, monthLength, selectedMonth])

  // Seed timeline with initial actions
  React.useEffect(() => {
    if (!timelineSeeded && actions?.length && protocol) {
      const dayPool = allScheduleDays
      const maxSlots = dayPool.length || 1
      setTimeline(
        actions.slice(0, Math.min(actions.length, maxSlots)).map((action, index) => ({
          instanceId: `sched-${action.id}-${index}`,
          actionId: action.id,
          dayOffset: dayPool[index % maxSlots] ?? 1,
          startHour: 9 + (index % 10),
          durationMinutes: 45,
        }))
      )
      setTimelineSeeded(true)
    }
  }, [actions, timelineSeeded, allScheduleDays, protocol])

  React.useEffect(() => {
    if (!selectedPaletteAction && paletteActions.length) {
      setSelectedPaletteAction(paletteActions[0].id)
    }
  }, [paletteActions, selectedPaletteAction])

  React.useEffect(() => {
    if (protocol) {
      setDraftProtocol({
        name: protocol.name,
        code: protocol.code,
        description: protocol.description,
        duration_type: protocol.duration_type,
        duration_value: protocol.duration_value.toString(),
        duration_extra_days: protocol.duration_extra_days.toString(),
        status: protocol.status,
      })
    }
  }, [protocol])

  const handleUpdateProtocol = async () => {
    if (!protocol) return

    if (!draftProtocol.name.trim()) {
      toast.error("Protocol name is required")
      return
    }
    if (!draftProtocol.code.trim()) {
      toast.error("Protocol code is required")
      return
    }
    if (!draftProtocol.duration_value || parseInt(draftProtocol.duration_value) <= 0) {
      toast.error("Duration value must be greater than 0")
      return
    }

    const payload = {
      program_id: programId,
      plan_id: protocol.plan_id,
      name: draftProtocol.name.trim(),
      code: draftProtocol.code.trim(),
      description: draftProtocol.description.trim(),
      duration_type: draftProtocol.duration_type,
      duration_value: parseInt(draftProtocol.duration_value),
      duration_extra_days: parseInt(draftProtocol.duration_extra_days) || 0,
      status: draftProtocol.status,
    }

    updateMutation.mutate(
      { id: protocol.id, payload },
      {
        onSuccess: () => {
          setEditOpen(false)
          toast.success("Protocol updated successfully")
        },
      }
    )
  }

  const handleDeleteProtocol = async () => {
    if (!protocol) return

    deleteMutation.mutate(protocol.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false)
        router.push(
          `/dashboard/super-admin/specialities/${specialityId}/workflow-programs/${programId}/protocols?programName=${encodeURIComponent(programName)}&specialityName=${encodeURIComponent(specialityName)}`
        )
      },
    })
  }

  const handleBack = () => {
    router.push(
      `/dashboard/super-admin/specialities/${specialityId}/workflow-programs/${programId}/protocols?programName=${encodeURIComponent(programName)}&specialityName=${encodeURIComponent(specialityName)}`
    )
  }

  // Schedule management handlers
  const scheduledByDay = React.useMemo(() => {
    const map = new Map<number, ScheduledAction[]>()
    timeline.forEach((entry) => {
      const existing = map.get(entry.dayOffset) ?? []
      existing.push(entry)
      map.set(entry.dayOffset, existing)
    })
    return map
  }, [timeline])

  const handleSelectDay = React.useCallback(
    (day: number) => {
      setTargetDay(day)
      if (isMonthDuration) {
        const inferred = Math.min(Math.max(1, Math.ceil(day / monthLength)), monthCount || 1)
        setSelectedMonth(inferred)
      }
    },
    [isMonthDuration, monthCount, monthLength],
  )

  const handleAddAction = React.useCallback(
    (action: ActionItem) => {
      const newEntry: ScheduledAction = {
        instanceId: crypto.randomUUID(),
        actionId: action.id,
        dayOffset: targetDay,
        startHour: 9,
        durationMinutes: 45,
      }
      setTimeline((prev) => [...prev, newEntry])
      toast.success(`${action.name} added to day ${targetDay}`)
    },
    [targetDay]
  )

  const handleQuickAddAction = React.useCallback(() => {
    if (!selectedPaletteAction) return
    const action = actionMap.get(selectedPaletteAction)
    if (action) {
      handleAddAction(action)
    }
  }, [selectedPaletteAction, actionMap, handleAddAction])

  const handleRemoveAction = React.useCallback((instanceId: string) => {
    setTimeline((prev) => prev.filter((entry) => entry.instanceId !== instanceId))
    toast.success("Action removed")
  }, [])

  const handlePaletteDragStart = React.useCallback((event: React.DragEvent, actionId: string) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData(ACTION_DRAG_TYPE, actionId)
  }, [])

  const handleEntryDragStart = React.useCallback((event: React.DragEvent, instanceId: string) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData(ENTRY_DRAG_TYPE, instanceId)
  }, [])

  const handleDayDrop = React.useCallback(
    (event: React.DragEvent, day: number, hour?: number) => {
      event.preventDefault()
      setDraggedSlotKey(null)

      const actionIdFromPalette = event.dataTransfer.getData(ACTION_DRAG_TYPE)
      if (actionIdFromPalette) {
        const action = actionMap.get(actionIdFromPalette)
        if (action) {
          const newEntry: ScheduledAction = {
            instanceId: crypto.randomUUID(),
            actionId: action.id,
            dayOffset: day,
            startHour: hour ?? 9,
            durationMinutes: 45,
          }
          setTimeline((prev) => [...prev, newEntry])
          toast.success(`${action.name} scheduled`)
        }
        return
      }

      const instanceId = event.dataTransfer.getData(ENTRY_DRAG_TYPE)
      if (instanceId) {
        setTimeline((prev) =>
          prev.map((entry) =>
            entry.instanceId === instanceId
              ? { ...entry, dayOffset: day, startHour: hour ?? entry.startHour }
              : entry
          )
        )
        toast.success("Action rescheduled")
      }
    },
    [actionMap]
  )

  const hourlyEntries = React.useMemo(() => {
    if (!isDayDuration) return []
    const hours = Array.from({ length: 10 }, (_, index) => 8 + index)
    return hours.map((hour) => ({
      hour,
      entries: timeline.filter((entry) => entry.startHour === hour),
    }))
  }, [timeline, isDayDuration])

  const displayedMonthDays = React.useMemo(() => {
    return allScheduleDays
  }, [allScheduleDays])

  const formatHourLabel = React.useCallback((hour: number) => {
    const normalized = ((hour % 24) + 24) % 24
    const suffix = normalized >= 12 ? "PM" : "AM"
    const display = normalized % 12 === 0 ? 12 : normalized % 12
    return `${display} ${suffix}`
  }, [])

  const formatTimeOfDayValue = React.useCallback(
    (hour: number) => `${String(((hour % 24) + 24) % 24).padStart(2, "0")}:00:00`,
    [],
  )

  const deriveTimeSlot = React.useCallback((hour: number) => {
    const normalized = ((hour % 24) + 24) % 24
    if (normalized < 6) return "night"
    if (normalized < 12) return "morning"
    if (normalized < 18) return "afternoon"
    return "evening"
  }, [])

  const handleSaveSchedule = React.useCallback(async () => {
    if (!protocol) {
      toast.error("Protocol not loaded")
      return
    }
    if (!timeline.length) {
      toast.error("Add at least one scheduled action before saving")
      return
    }

    const orderedTimeline = [...timeline].sort((a, b) => {
      if (a.dayOffset !== b.dayOffset) {
        return a.dayOffset - b.dayOffset
      }
      return a.startHour - b.startHour
    })

    const daySequences = new Map<number, number>()
    const updates = orderedTimeline.map((entry) => {
      const sequence = (daySequences.get(entry.dayOffset) ?? 0) + 1
      daySequences.set(entry.dayOffset, sequence)
      const monthNumber = isMonthDuration ? Math.floor((entry.dayOffset - 1) / monthLength) + 1 : 1
      const dayOfMonth = isMonthDuration ? ((entry.dayOffset - 1) % monthLength) + 1 : entry.dayOffset

      return {
        actionId: entry.actionId,
        payload: {
          protocol_id: protocol.id,
          action_id: entry.actionId,
          month_number: monthNumber,
          day_of_month: dayOfMonth,
          time_of_day: formatTimeOfDayValue(entry.startHour),
          time_slot: deriveTimeSlot(entry.startHour),
          sequence,
          is_mandatory: true,
          duration_mins: entry.durationMinutes,
          requires_specific_staff: false,
          staff_type_override: null,
        },
      }
    })

    try {
      await bulkUpdateProtocolActions.mutateAsync(updates)
      toast.success("Protocol schedule saved")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to save schedule")
    }
  }, [bulkUpdateProtocolActions, deriveTimeSlot, formatTimeOfDayValue, isMonthDuration, monthLength, protocol, timeline])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-sm">Loading protocol details...</div>
      </div>
    )
  }

  if (isError || !protocol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <p className="text-slate-600 font-medium">Failed to load protocol details</p>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Protocols
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-20 px-4 md:px-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-11 rounded-full border border-slate-200 text-slate-600 px-5 text-[11px] font-black uppercase tracking-[0.2em]"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="rounded-[2rem] border border-slate-100 bg-white px-6 py-8 md:px-10 md:py-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.6)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-slate-400 uppercase">
                <span className="h-2 w-2 rounded-full bg-primary" /> Protocol Configuration
              </div>
              <div>
                <h1 className="text-3xl md:text-[44px] font-black leading-none text-slate-900">
                  {protocol.name.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    {protocol.name.split(" ").slice(-1)[0]}
                  </span>
                </h1>
                <p className="mt-3 text-sm md:text-base text-slate-500 font-medium">
                  {protocol.description || "Protocol management and configuration."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-500">
                  Code · {protocol.code}
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-500">
                  Plan · {protocol.plan_name}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-1",
                    protocol.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : protocol.status === "draft"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-600"
                        : "border-slate-200 text-slate-500"
                  )}
                >
                  {protocol.status}
                </Badge>
                <span>Program · {programName}</span>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row">
              <Button
                size="sm"
                variant="outline"
                className="h-11 rounded-full border-slate-200 text-slate-600 px-6 text-[11px] font-black uppercase tracking-[0.2em]"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                size="sm"
                className="h-11 rounded-full bg-slate-900 text-white px-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Left Sidebar - Action Palette */}
          <div className="space-y-6 w-full md:w-[320px] lg:w-[360px] xl:w-[400px] shrink-0">
            <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6 pb-2 space-y-3">
                <div className="flex flex-col gap-3">
                  <div className="flex lg:flex-col justify-between gap-3">
                    <div className="flex flex-start items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 leading-none">
                        Action Palette
                      </CardTitle>
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
                      <Button
                        size="sm"
                        className="h-9 cursor-pointer rounded-full bg-primary text-white px-4 text-[10px] font-black uppercase tracking-[0.2em]"
                        onClick={handleQuickAddAction}
                      >
                        <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Drag actions or use quick add to schedule automation triggers.
                  </CardDescription>
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
                          <p className="text-[10px] font-medium leading-tight opacity-80 line-clamp-2 pr-4">
                            {action.description}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-lg hover:bg-white/50 shrink-0"
                            onClick={() => handleAddAction(action)}
                          >
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

          {/* Right Main Content - Protocol Schedule */}
          <Card className="fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden flex-1">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-8 border-b border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Protocol Schedule</CardTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <CardDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                      {isDayDuration ? "Day-by-day" : "Month-by-month"} action scheduling
                    </CardDescription>
                    {isMonthDuration && selectedMonthSummary && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                        {selectedMonthSummary}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                {isMonthDuration && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol segment</span>
                    <Select
                      value={String(selectedMonth)}
                      onValueChange={(value) => {
                        const monthNumber = Number(value)
                        setSelectedMonth(monthNumber)
                        const firstDay = (monthNumber - 1) * monthLength + 1
                        setTargetDay(firstDay)
                      }}
                    >
                      <SelectTrigger className="h-9 w-[160px] rounded-full border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <SelectValue placeholder="Choose protocol" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                        {monthOptions.map((option) => (
                          <SelectItem key={option} value={String(option)} className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Protocol {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  onClick={handleSaveSchedule}
                  disabled={bulkUpdateProtocolActions.isPending || !timeline.length}
                  className="h-10 rounded-full bg-primary text-white px-6 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  {bulkUpdateProtocolActions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save schedule
                </Button>
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
                          <div className={cn("text-sm font-black tracking-widest", isSelected ? "text-primary" : "text-slate-500")}>
                            {formatHourLabel(hour)}
                          </div>
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
                    {dayCells.map(({ label, value }) => {
                      const entries = scheduledByDay.get(value) ?? []
                      const isSelected = targetDay === value
                      const slotKey = `day-${value}`
                      const isDragTarget = draggedSlotKey === slotKey
                      return (
                        <div
                          key={value}
                          onClick={() => handleSelectDay(value)}
                          onDragEnter={(event) => {
                            event.preventDefault()
                            setDraggedSlotKey(slotKey)
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => handleDayDrop(event, value)}
                          onDragLeave={(event) => {
                            event.preventDefault()
                            setDraggedSlotKey((prev) => (prev === slotKey ? null : prev))
                          }}
                          className={cn(
                            "group relative min-h-[90px] rounded-2xl border p-2 text-left transition-all duration-300 cursor-pointer overflow-hidden",
                            isSelected || isDragTarget
                              ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-inner"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn("text-[10px] font-black tracking-widest", isSelected ? "text-primary" : "text-slate-400")}>
                            {label}
                          </div>
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
                                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-1 pr-3">
                                    {action.name}
                                  </p>
                                  <button
                                    className="absolute top-1 right-1 h-4 w-4 rounded-full bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs opacity-0 group-hover/entry:opacity-100 transition-opacity"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      handleRemoveAction(entry.instanceId)
                                    }}
                                  >
                                    <X className="h-2.5 w-2.5" />
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Protocol Drawer */}
      <Drawer
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open && protocol) {
            setDraftProtocol({
              name: protocol.name,
              code: protocol.code,
              description: protocol.description,
              duration_type: protocol.duration_type,
              duration_value: protocol.duration_value.toString(),
              duration_extra_days: protocol.duration_extra_days.toString(),
              status: protocol.status,
            })
          }
        }}
        direction="right"
      >
        <DrawerContent className="h-full min-w-lg max-w-4xl">
          <DrawerHeader className="border-b border-slate-100">
            <DrawerTitle className="text-2xl font-black text-slate-900">Edit Protocol</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Protocol Name *
                </Label>
                <Input
                  value={draftProtocol.name}
                  onChange={(e) => setDraftProtocol({ ...draftProtocol, name: e.target.value })}
                  placeholder="e.g. Intensive Protocol"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Protocol Code *
                </Label>
                <Input
                  value={draftProtocol.code}
                  onChange={(e) => setDraftProtocol({ ...draftProtocol, code: e.target.value })}
                  placeholder="e.g. WK-PROTO-V1"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Description
                </Label>
                <Textarea
                  value={draftProtocol.description}
                  onChange={(e) => setDraftProtocol({ ...draftProtocol, description: e.target.value })}
                  placeholder="Describe the protocol..."
                  className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Duration Type *
                  </Label>
                  <Select
                    value={draftProtocol.duration_type}
                    onValueChange={(value) => setDraftProtocol({ ...draftProtocol, duration_type: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Duration Value *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={draftProtocol.duration_value}
                    onChange={(e) => setDraftProtocol({ ...draftProtocol, duration_value: e.target.value })}
                    placeholder="0"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Extra Days
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={draftProtocol.duration_extra_days}
                  onChange={(e) =>
                    setDraftProtocol({ ...draftProtocol, duration_extra_days: e.target.value })
                  }
                  placeholder="0"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Status *
                </Label>
                <Select
                  value={draftProtocol.status}
                  onValueChange={(value) => setDraftProtocol({ ...draftProtocol, status: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="h-12 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProtocol}
              disabled={updateMutation.isPending}
              className="h-12 px-8 rounded-xl bg-primary hover:scale-[1.02] transition-all text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-lg shadow-primary/25 active:scale-95"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.5rem] bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-slate-900">
              Delete this protocol?
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 px-4">
              You are about to permanently remove <strong>{protocol.name}</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
            <Button
              variant="ghost"
              className="flex-1 rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Keep Protocol
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100"
              onClick={handleDeleteProtocol}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
