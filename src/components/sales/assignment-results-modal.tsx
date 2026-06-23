"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Users, CheckCircle, Clock, ArrowRight, X, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface AssignmentResult {
  lead_id: string
  caller_id: string
  expires_at: string
  lead_name?: string
  telecaller_name?: string
}

interface AssignmentResultsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: AssignmentResult[]
  jobId: string
  onCancel?: () => void
}

type TelecallerInfo = {
  id: string
  name?: string
  email?: string
  status?: string
}

export function AssignmentResultsModal({ open, onOpenChange, results, jobId, onCancel }: AssignmentResultsModalProps) {
  const [isCancelling, setIsCancelling] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [telecallerMap, setTelecallerMap] = React.useState<Record<string, TelecallerInfo>>({})

  React.useEffect(() => {
    if (!open) return

    let isMounted = true

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

        if (isMounted) {
          setTelecallerMap(map)
        }
      } catch (error) {
        console.error("Failed to load telecallers", error)
        if (isMounted) {
          setTelecallerMap({})
        }
      }
    }

    loadTelecallers()

    return () => {
      isMounted = false
    }
  }, [open])

  const getTelecallerById = React.useCallback((id: string): TelecallerInfo => {
    return telecallerMap[id] || { id }
  }, [telecallerMap])

  const getAssignmentStats = React.useCallback(() => {
    const stats = new Map<string, { count: number; telecaller: TelecallerInfo }>()

    results.forEach((result) => {
      const telecaller = getTelecallerById(result.caller_id)
      const existing = stats.get(result.caller_id) || { count: 0, telecaller }
      stats.set(result.caller_id, { count: existing.count + 1, telecaller })
    })

    return Array.from(stats.values())
  }, [results, getTelecallerById])

  const handleCancelAssignment = async () => {
    setIsCancelling(true)
    try {
      const response = await apiClient.delete(`/leads/assign/cancel/job/${jobId}`)
      
      if (response.data.success) {
        toast.success("Assignment cancelled successfully.")
        onOpenChange(false)
        if (onCancel) {
          onCancel()
        }
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
        onOpenChange(false)
      } else {
        toast.error(response.data.message || "Failed to confirm assignments.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while confirming assignments.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Assignment Completed Successfully
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success Summary */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Assignment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Leads Assigned</span>
                  <Badge variant="default" className="bg-green-600">{results.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Job ID</span>
                  <span className="text-xs font-mono text-muted-foreground">{jobId}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Leads have been successfully assigned to telecallers and are ready for follow-up
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Telecaller Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getAssignmentStats().map(({ telecaller, count }) => {
                  // Try to find a result with telecaller_name for this telecaller
                  const resultWithName = results.find(r => r.caller_id === telecaller.id && r.telecaller_name)
                  const displayName = resultWithName?.telecaller_name?.trim() || telecaller.name?.trim() || telecaller.id
                  const secondaryLabel = (resultWithName?.telecaller_name?.trim() || telecaller.name?.trim()) ? telecaller.email ?? telecaller.id : telecaller.email
                  const isActive = (telecaller.status ?? "active") === "active"
                  return (
                    <div key={`${telecaller.id}-${displayName}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isActive ? "bg-green-500" : "bg-amber-500"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{displayName}</p>
                          {secondaryLabel && (
                            <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{count} leads</Badge>
                        <p className="text-xs text-muted-foreground mt-1">New assignments</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Individual Assignments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Assigned Leads Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((result, index) => {
                  const telecaller = getTelecallerById(result.caller_id)
                  const isActive = (telecaller.status ?? "active") === "active"
                  const displayName = result.telecaller_name?.trim() || telecaller.name?.trim() || telecaller.id
                  
                  return (
                    <div key={`${result.lead_id}-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{result.lead_name || `Lead #${result.lead_id.slice(-8)}`}</span>
                          <span className="text-xs text-muted-foreground font-mono">{result.lead_id}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isActive ? "bg-green-500" : "bg-amber-500"
                          )} />
                          <div className="text-right">
                            <p className="text-sm font-medium">{displayName}</p>
                            <p className="text-xs text-muted-foreground">Expires: {new Date(result.expires_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
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
          >
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Assignments
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
