"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Lead } from "@/components/sales/types"
import { useTelecallers } from "@/hooks/use-telecallers"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight, Clock, Edit, Save, CircleCheck, Sparkles, ShieldCheck, Layers3, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"


interface AssignLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leads: Lead[]
  onUpdate: () => void
}

interface LeadAssignment {
  leadId: string
  leadName: string
  telecallerId: string
  originalTelecallerId?: string
}

interface TelecallerOption {
  id: string
  name?: string | null
  email?: string | null
  status?: string | null
  is_active?: boolean | null
}

export function AssignLeadModal({ open, onOpenChange, leads, onUpdate }: AssignLeadModalProps) {
  const queryClient = useQueryClient()
  const { data: telecallers = [] } = useTelecallers({ enabled: open }) as { data: TelecallerOption[]; isLoading: boolean }
  const [assignments, setAssignments] = React.useState<LeadAssignment[]>([])
  const [isAssigning, setIsAssigning] = React.useState(false)

  // Auto-assign leads on modal open
  React.useEffect(() => {
    if (open && leads.length > 0 && telecallers.length > 0) {
      const autoAssignments: LeadAssignment[] = []
      
      // Get active telecallers sorted by workload (round-robin for now since we don't have workload data)
      const activeTelecallers = telecallers.filter((tc) => tc.status === "active" || tc.is_active !== false)
      
      if (activeTelecallers.length === 0) return
      
      leads.forEach((lead, index) => {
        // Round-robin assignment using index
        const telecallerIndex = index % activeTelecallers.length
        const telecaller = activeTelecallers[telecallerIndex]
        
        autoAssignments.push({
          leadId: lead.id,
          leadName: lead.patientName,
          telecallerId: telecaller.id,
          originalTelecallerId: telecaller.id // For tracking changes
        })
      })
      
      setAssignments(autoAssignments)
    }
  }, [open, leads, telecallers])

  const handleTelecallerChange = (leadId: string, newTelecallerId: string) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.leadId === leadId 
          ? { ...assignment, telecallerId: newTelecallerId }
          : assignment
      )
    )
  }

  const handleAssign = async () => {
    if (assignments.length === 0) return
    
    setIsAssigning(true)
    
    try {
      // Group assignments by telecaller for bulk API calls
      const assignmentsByTelecaller = new Map<string, string[]>()
      
      assignments.forEach(assignment => {
        if (!assignmentsByTelecaller.has(assignment.telecallerId)) {
          assignmentsByTelecaller.set(assignment.telecallerId, [])
        }
        assignmentsByTelecaller.get(assignment.telecallerId)!.push(assignment.leadId)
      })
      
      // Make API calls for each telecaller
      const promises = Array.from(assignmentsByTelecaller.entries()).map(async ([telecallerId, leadIds]) => {
        const payload = {
          leadIds,
          telecallerId
        }
        
        const response = await apiClient.post("/leads/assign-multiple", payload)
        
        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to assign leads")
        }
        
        return response.data
      })
      
      await Promise.all(promises)
      
      toast.success(`Successfully assigned ${assignments.length} leads`)
      
      // Invalidate leads query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      
      onUpdate()
      onOpenChange(false)
      setAssignments([])
    } catch (error: unknown) {
      console.error("Assignment failed:", error)
      const message = error instanceof Error ? error.message : "Failed to assign leads"
      toast.error(message)
    } finally {
      setIsAssigning(false)
    }
  }

  const getTelecallerById = (id: string) => telecallers.find((tc) => tc.id === id)

  const getAssignmentStats = () => {
    const stats = new Map<string, { count: number, telecaller: TelecallerOption }>()
    
    assignments.forEach(assignment => {
      const telecaller = getTelecallerById(assignment.telecallerId)
      if (telecaller) {
        const existing = stats.get(assignment.telecallerId) || { count: 0, telecaller }
        stats.set(assignment.telecallerId, { count: existing.count + 1, telecaller })
      }
    })
    
    return Array.from(stats.values())
  }

  const hasChanges = assignments.some(a => a.telecallerId !== a.originalTelecallerId)
  const assignmentStats = getAssignmentStats()
  const activeTelecallerCount = telecallers.filter((tc) => tc.status === "active" || tc.is_active !== false).length

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ml-auto flex h-full min-w-2xl max-w-[820px] flex-col overflow-hidden rounded-l-[32px] border border-white/30 bg-gradient-to-b from-white/95 via-white/90 to-slate-50/90 shadow-[0_45px_100px_rgba(15,23,42,0.25)] backdrop-blur-3xl">
        <div className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-l-[32px]">
            <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute right-[-40px] bottom-[-30px] h-52 w-52 rounded-full bg-emerald-200/35 blur-[130px]" />
          </div>

          <div className="space-y-8 p-8">
         

            <section className="grid gap-6 xl:grid-cols-1">
            

              <Card className="border-white/70 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700"><Layers3 className="h-4 w-4 text-primary" /> Assignment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {assignmentStats.length ? (
                      assignmentStats.map(({ telecaller, count }) => (
                        <div key={telecaller.id} className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "inline-flex h-2.5 w-2.5 rounded-full",
                                telecaller.status === "active" || telecaller.is_active !== false ? "bg-emerald-500" : "bg-amber-400"
                              )}
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{telecaller.name || telecaller.email || telecaller.id}</p>
                              <p className="text-xs text-slate-500">{telecaller.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full font-semibold">{count} leads</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">Assignments will appear here once leads are queued.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            <Card className="border-white/70 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.15)] overflow-hidden">
              <CardHeader className="border-b border-slate-100/80 bg-slate-50/70 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Edit className="h-4 w-4" /> Review & Modify Assignments
                  {hasChanges && (
                    <Badge variant="outline" className="text-xs">Modified</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {assignments.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                      No leads selected yet. Choose records from the table to craft assignments.
                    </div>
                  )}
                  {assignments.map((assignment) => {
                    const telecaller = getTelecallerById(assignment.telecallerId)
                    const isChanged = assignment.telecallerId !== assignment.originalTelecallerId

                    return (
                      <div
                        key={assignment.leadId}
                        className={cn(
                          "flex flex-col gap-4 rounded-[24px] border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
                          isChanged ? "border-blue-200 bg-blue-50/50" : "border-slate-200/80 bg-white"
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate text-sm font-semibold text-slate-900">{assignment.leadName}</span>
                            <div className="flex flex-wrap gap-2">
                              {isChanged && <Badge variant="outline" className="w-fit text-xs">Changed</Badge>}
                              {telecaller ? <Badge variant="secondary" className="text-xs">{telecaller.name || telecaller.email || telecaller.id}</Badge> : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:pl-4">
                          <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                          <Select value={assignment.telecallerId} onValueChange={(value) => handleTelecallerChange(assignment.leadId, value)}>
                            <SelectTrigger className="w-full min-w-[220px] rounded-2xl border-slate-200 bg-white/90 shadow-sm sm:w-[240px]">
                              <SelectValue placeholder="Select telecaller" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200/80 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                              {telecallers.map((tc) => (
                                <SelectItem key={tc.id} value={tc.id} className="rounded-xl py-3 focus:bg-slate-50">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span
                                      className={cn(
                                        "inline-flex h-2 w-2 rounded-full",
                                        tc.status === "active" || tc.is_active !== false ? "bg-emerald-500" : "bg-amber-500"
                                      )}
                                    />
                                    <span className="truncate text-sm font-medium text-slate-700">{tc.name || tc.email || tc.id}</span>
                                   
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/70 p-4 sm:flex-row sm:justify-end">
              <Button variant="outline" className="h-11 rounded-2xl border-slate-200/70 bg-white/90 px-6" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="h-11 rounded-2xl bg-gradient-to-r from-emerald-500 via-primary to-blue-500 px-8 font-semibold text-white shadow-[0_20px_40px_rgba(37,99,235,0.35)]"
                onClick={handleAssign}
                disabled={isAssigning || assignments.length === 0}
              >
                {isAssigning ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Assignments
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function MetricCard({ label, value, helper, accent }: { label: string; value: React.ReactNode; helper: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className={cn("mt-3 text-3xl font-black", accent)}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  )
}

function StatusPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
    </div>
  )
}
