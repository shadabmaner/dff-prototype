"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { DndContext, closestCenter, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Users, CheckCircle, Clock, ArrowRight, X, Save, ArrowLeft, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { TelecallerDropZone } from "@/components/sales/telecaller-drop-zone"

interface AssignmentResult {
  lead_id: string
  caller_id: string
  expires_at: string
  lead_name?: string
  telecaller_name?: string
}

interface TelecallerInfo {
  id: string
  name?: string
  email?: string
  status?: string
}

export default function AssignmentResultsPage() {
  const queryClient = useQueryClient()
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [isCancelling, setIsCancelling] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isReassigning, setIsReassigning] = React.useState(false)
  const [telecallerMap, setTelecallerMap] = React.useState<Record<string, TelecallerInfo>>({})
  const [assignmentResults, setAssignmentResults] = React.useState<AssignmentResult[]>([])
  const [currentAssignments, setCurrentAssignments] = React.useState<AssignmentResult[]>([])
  const [draggedLead, setDraggedLead] = React.useState<AssignmentResult | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOverId, setDragOverId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadAssignmentResults = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get(`/leads/assign/preview/job/${jobId}`)

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to load assignment results")
        }

        const jobData = response.data.data
        if (jobData.status !== "COMPLETED") {
          throw new Error(`Assignment job is ${jobData.status.toLowerCase()}`)
        }

        const results = jobData.preview || []
        setAssignmentResults(results)
        setCurrentAssignments(results)
      } catch (err: any) {
        setError(err.message || "Failed to load assignment results")
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      loadAssignmentResults()
    }
  }, [jobId])

  React.useEffect(() => {
    const loadTelecallers = async () => {
      try {
        const response = await apiClient.get("/sales/telecallers")
        const payload = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : []

        const map = (payload as any[]).reduce<Record<string, TelecallerInfo>>((acc, item) => {
          if (!item?.id) return acc
          acc[item.id] = {
            id: item.id,
            name: item.name || item.full_name || item.display_name,
            email: item.email,
            status: item.is_active === false ? "inactive" : "active",
          }
          return acc
        }, {})

        setTelecallerMap(map)
      } catch (error) {
        console.error("Failed to load telecallers", error)
        setTelecallerMap({})
      }
    }

    if (assignmentResults.length > 0) {
      loadTelecallers()
    }
  }, [assignmentResults])

  const getTelecallerById = React.useCallback((id: string): TelecallerInfo => {
    return telecallerMap[id] || { id }
  }, [telecallerMap])

  const getAssignmentStats = React.useCallback(() => {
    const stats = new Map<string, { count: number; telecaller: TelecallerInfo }>()

    currentAssignments.forEach((result) => {
      const telecaller = getTelecallerById(result.caller_id)
      const existing = stats.get(result.caller_id) || { count: 0, telecaller }
      stats.set(result.caller_id, { count: existing.count + 1, telecaller })
    })

    return Array.from(stats.values())
  }, [currentAssignments, getTelecallerById])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = currentAssignments.find(l => l.lead_id === event.active.id)
    setDraggedLead(lead || null)
    setIsDragging(true)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setDragOverId(over?.id as string || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)
    setDragOverId(null)

    if (!over || active.id === over.id) {
      return
    }

    const leadId = active.id as string
    const newCallerId = over.id as string

    // Check if this is actually a reassignment
    const currentAssignment = currentAssignments.find(l => l.lead_id === leadId)
    if (currentAssignment && currentAssignment.caller_id !== newCallerId) {
      await handleReassignLead(leadId, currentAssignment.caller_id, newCallerId)
    }
  }

  const handleReassignLead = async (leadId: string, oldCallerId: string, newCallerId: string) => {
    setIsReassigning(true)
    try {
      const response = await apiClient.put(`/leads/assign/preview/job/${jobId}`, {
        assignments: [
          {
            leadId: leadId,
            newCallerId: newCallerId
          }
        ]
      })

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to reassign lead")
      }

      // Update local state
      setCurrentAssignments(prev =>
        prev.map(assignment =>
          assignment.lead_id === leadId
            ? {
              ...assignment,
              caller_id: newCallerId,
              telecaller_name: newTelecaller.name || newTelecaller.email || newTelecaller.id
            }
            : assignment
        )
      )

      const newTelecaller = getTelecallerById(newCallerId)
      const lead = currentAssignments.find(l => l.lead_id === leadId)

      toast.success(
        `Lead "${lead?.lead_name || 'Unnamed Lead'}" reassigned to ${newTelecaller.name || newTelecaller.email || 'Telecaller'}`
      )
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to reassign lead")
    } finally {
      setIsReassigning(false)
    }
  }

  const getLeadsByTelecaller = React.useCallback((telecallerId: string) => {
    return currentAssignments.filter(result => result.caller_id === telecallerId)
  }, [currentAssignments])

  const handleCancelAssignment = async () => {
    setIsCancelling(true)
    try {
      const response = await apiClient.delete(`/leads/assign/cancel/job/${jobId}`)

      if (response.data.success) {
        toast.success("Assignment cancelled successfully.")

        // Invalidate leads query to refetch updated data
        queryClient.invalidateQueries({ queryKey: ["leads"] })

        router.push("/dashboard/sales/lead-assignment")
      } else {
        toast.error(response.data.message || "Failed to cancel assignment.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while cancelling assignment.")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSaveAssignment = async () => {
    setIsSaving(true)
    try {
      const response = await apiClient.post(`/leads/assign/confirm/job/${jobId}`, {})

      if (response.data.success) {
        toast.success("Assignments confirmed and saved successfully!")

        // Invalidate leads query to refetch updated data
        queryClient.invalidateQueries({ queryKey: ["leads"] })

        router.push("/dashboard/sales/lead-assignment")
      } else {
        toast.error(response.data.message || "Failed to confirm assignments.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while confirming assignments.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Loading assignment results...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["leads"] })
              router.push("/dashboard/sales/lead-assignment")
            }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignment Results</h1>
              <p className="text-sm text-gray-500 mt-1">
                Review and confirm lead assignments to telecallers
              </p>
            </div>
          </div>
        </div>

        {/* Success Summary */}
        <Card className="border-green-200 bg-green-50/50">
          {/* <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Assignment Completed Successfully
          </CardTitle>
        </CardHeader> */}
          {/* <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Leads Assigned</span>
              <Badge variant="default" className="bg-green-600">{assignmentResults.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="default" className="bg-green-600">Completed</Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            Leads have been successfully assigned to telecallers and are ready for follow-up
          </div>
        </CardContent> */}
        </Card>

        {/* Assignment Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Telecaller Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAssignmentStats().map(({ telecaller, count }) => {
                // Try to find a result with telecaller_name for this telecaller
                const resultWithName = currentAssignments.find(r => r.caller_id === telecaller.id && r.telecaller_name)
                const displayName = resultWithName?.telecaller_name?.trim() || telecaller.name?.trim() || telecaller.email?.trim() || 'Telecaller'
                const secondaryLabel = telecaller.email?.trim()
                const isActive = (telecaller.status ?? "active") === "active"
                return (
                  <div key={`${telecaller.id}-${displayName}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        isActive ? "bg-green-500" : "bg-amber-500"
                      )} />
                      <div>
                        <p className="text-sm font-semibold">{displayName}</p>
                        {secondaryLabel && (
                          <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-sm">{count} leads</Badge>
                      <p className="text-xs text-muted-foreground mt-1">New assignments</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Drag and Drop Assignments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Lead Assignments - Drag & Drop to Reassign</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className={cn("h-4 w-4", isReassigning && "animate-spin")} />
                {isReassigning ? "Reassigning..." : "Drag leads between telecallers"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAssignmentStats().map(({ telecaller }) => {
                const leads = getLeadsByTelecaller(telecaller.id)
                const isOver = dragOverId === telecaller.id

                return (
                  <TelecallerDropZone
                    key={telecaller.id}
                    telecaller={telecaller}
                    leads={leads}
                    isOver={isOver}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
          <div className="text-sm text-muted-foreground">
            Review the assignments above and choose to confirm or cancel
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              onClick={handleCancelAssignment}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Assignment
                </>
              )}
            </Button>

            <Button
              onClick={handleSaveAssignment}
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Confirm Assignments
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DndContext>
  )
}
