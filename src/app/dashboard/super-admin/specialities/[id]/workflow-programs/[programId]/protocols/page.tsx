"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Calendar, Clock, Code, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  useProtocols,
  useCreateProtocol,
  useUpdateProtocol,
  useDeleteProtocol,
  type Protocol,
  type CreateProtocolPayload,
  type UpdateProtocolPayload,
} from "@/hooks/use-protocols"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DraftProtocol {
  name: string
  code: string
  description: string
  duration_type: string
  duration_value: string
  duration_extra_days: string
  status: string
}

function createDefaultDraft(): DraftProtocol {
  return {
    name: "",
    code: "",
    description: "",
    duration_type: "months",
    duration_value: "",
    duration_extra_days: "0",
    status: "draft",
  }
}

export default function ProtocolsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const specialityId = params.id as string
  const programId = params.programId as string
  const planId = searchParams.get("planId") || ""
  const planName = searchParams.get("planName") || ""

  const programName = searchParams.get("programName") || "Workflow Program"
  const specialityName = searchParams.get("specialityName") || "Speciality"

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const [draftProtocol, setDraftProtocol] = useState<DraftProtocol>(createDefaultDraft())

  const { data: protocols = [], isLoading, error } = useProtocols(programId)
  const createMutation = useCreateProtocol()
  const updateMutation = useUpdateProtocol()
  const deleteMutation = useDeleteProtocol()

  useEffect(() => {
    if (error) {
      toast.error("Failed to load protocols")
    }
  }, [error])

  const handleOpenCreateDrawer = () => {
    setDraftProtocol(createDefaultDraft())
    setCreateDrawerOpen(true)
  }

  const handleOpenEditDrawer = (protocol: Protocol) => {
    setSelectedProtocol(protocol)
    setDraftProtocol({
      name: protocol.name,
      code: protocol.code,
      description: protocol.description,
      duration_type: protocol.duration_type,
      duration_value: protocol.duration_value.toString(),
      duration_extra_days: protocol.duration_extra_days.toString(),
      status: protocol.status,
    })
    setEditDrawerOpen(true)
  }

  const handleCreateProtocol = async () => {
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

    const payload: CreateProtocolPayload = {
      program_id: programId,
      plan_id: planId,
      name: draftProtocol.name.trim(),
      code: draftProtocol.code.trim(),
      description: draftProtocol.description.trim(),
      duration_type: draftProtocol.duration_type,
      duration_value: parseInt(draftProtocol.duration_value),
      duration_extra_days: parseInt(draftProtocol.duration_extra_days) || 0,
      status: draftProtocol.status,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setCreateDrawerOpen(false)
        setDraftProtocol(createDefaultDraft())
      },
    })
  }

  const handleUpdateProtocol = async () => {
    if (!selectedProtocol) return

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

    const payload: UpdateProtocolPayload = {
      program_id: programId,
      plan_id: planId,
      name: draftProtocol.name.trim(),
      code: draftProtocol.code.trim(),
      description: draftProtocol.description.trim(),
      duration_type: draftProtocol.duration_type,
      duration_value: parseInt(draftProtocol.duration_value),
      duration_extra_days: parseInt(draftProtocol.duration_extra_days) || 0,
      status: draftProtocol.status,
    }

    updateMutation.mutate(
      { id: selectedProtocol.id, payload },
      {
        onSuccess: () => {
          setEditDrawerOpen(false)
          setSelectedProtocol(null)
          setDraftProtocol(createDefaultDraft())
        },
      }
    )
  }

  const handleDeleteProtocol = async (protocolId: string) => {
    if (!confirm("Are you sure you want to delete this protocol? This action cannot be undone.")) {
      return
    }

    deleteMutation.mutate(protocolId)
  }

  const handleBack = () => {
    router.push(
      `/dashboard/super-admin/specialities/${specialityId}/workflow-programs/${programId}?language=en`
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }
console.log(protocols,"protocols")
  return (
    <div className="space-y-8 pb-10 px-4 md:px-0">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 md:p-14 shadow-2xl border border-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-primary/20 blur-[130px]" />
          <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
        </div>

        <div className="relative z-10">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Program
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-xl shadow-primary/25 border border-white/10">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 leading-none mb-1">
                    Protocol Management
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-white/50">
                    {programName}
                  </span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.9] mb-6">
                {planName} <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">Protocols</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                Create and manage intensive protocols for this workflow program.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleOpenCreateDrawer}
                className="h-14 px-8 rounded-2xl bg-primary hover:scale-[1.02] transition-all text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-lg shadow-primary/25 active:scale-95"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Protocol
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Protocols List */}
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <Card className="fresh-card-alt border-none shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-10 border-b border-slate-100/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                  Protocols Catalogue
                </CardTitle>
              </div>
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.25em]">
                {protocols?.length} protocol{protocols.length !== 1 ? "s" : ""} defined
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-slate-400 text-sm">Loading protocols...</div>
              </div>
            ) : protocols?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-400 font-medium">No protocols created yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "Create Protocol" to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100/50">
                    <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Protocol
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Code
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Duration
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Status
                    </TableHead>
                    <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {protocols?.map((protocol:any) => (
                      <motion.tr
                        key={protocol.id}
                        variants={item}
                        layout
                        className="group/row border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/super-admin/specialities/${specialityId}/workflow-programs/${programId}/protocols/${protocol.id}?programName=${encodeURIComponent(programName)}&specialityName=${encodeURIComponent(specialityName)}`)}
                      >
                        <TableCell className="pl-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover/row:bg-primary group-hover/row:text-white transition-all duration-300">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 uppercase tracking-tight text-[15px]">
                                {protocol.name}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {protocol.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm border-none uppercase tracking-widest bg-slate-100 text-slate-600">
                            <Code className="h-3 w-3 mr-1" />
                            {protocol.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-bold">
                              {protocol.duration_value} {protocol.duration_type}
                              {protocol.duration_extra_days > 0 && ` +${protocol.duration_extra_days}d`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm border-none uppercase tracking-widest",
                              protocol.status === "active"
                                ? "bg-green-500/10 text-green-600"
                                : protocol.status === "draft"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-slate-100 text-slate-400"
                            )}
                          >
                            {protocol.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenEditDrawer(protocol)
                              }}
                              className="h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border-slate-100 hover:bg-blue-50 hover:text-blue-600 border-blue-100/50 text-blue-500"
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProtocol(protocol.id)
                              }}
                              className="h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border-slate-100 hover:bg-rose-50 hover:text-rose-600 border-rose-100/50 text-rose-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Protocol Drawer */}
      <Drawer
        open={createDrawerOpen}
        onOpenChange={(open) => {
          setCreateDrawerOpen(open)
          if (!open) {
            setDraftProtocol(createDefaultDraft())
          }
        }}
        direction="right"
      >
        <DrawerContent className="h-full min-w-lg max-w-4xl">
          <DrawerHeader className="border-b border-slate-100">
            <DrawerTitle className="text-2xl font-black text-slate-900">Create New Protocol</DrawerTitle>
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
                    onValueChange={(value) =>
                      setDraftProtocol({ ...draftProtocol, duration_type: value })
                    }
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
                    onChange={(e) =>
                      setDraftProtocol({ ...draftProtocol, duration_value: e.target.value })
                    }
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
              onClick={() => setCreateDrawerOpen(false)}
              className="h-12 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProtocol}
              disabled={createMutation.isPending}
              className="h-12 px-8 rounded-xl bg-primary hover:scale-[1.02] transition-all text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-lg shadow-primary/25 active:scale-95"
            >
              {createMutation.isPending ? "Creating..." : "Create Protocol"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit Protocol Drawer */}
      <Drawer
        open={editDrawerOpen}
        onOpenChange={(open) => {
          setEditDrawerOpen(open)
          if (!open) {
            setSelectedProtocol(null)
            setDraftProtocol(createDefaultDraft())
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
                    onValueChange={(value) =>
                      setDraftProtocol({ ...draftProtocol, duration_type: value })
                    }
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
                    onChange={(e) =>
                      setDraftProtocol({ ...draftProtocol, duration_value: e.target.value })
                    }
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
              onClick={() => setEditDrawerOpen(false)}
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
    </div>
  )
}
