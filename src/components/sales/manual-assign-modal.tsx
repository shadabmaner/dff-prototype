"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Lead } from "@/components/sales/types"
import { useTelecallers } from "@/hooks/use-telecallers"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Users, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

interface ManualAssignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leads: Lead[]
  onUpdate: () => void
}

export function ManualAssignModal({ open, onOpenChange, leads, onUpdate }: ManualAssignModalProps) {
  const queryClient = useQueryClient()
  const { data: telecallers = [], isLoading: isLoadingTelecallers } = useTelecallers({ enabled: open })
  const [selectedTelecallerId, setSelectedTelecallerId] = React.useState("")
  const [isAssigning, setIsAssigning] = React.useState(false)

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedTelecallerId("")
    }
  }, [open])

  // Auto-select first telecaller when data loads
  React.useEffect(() => {
    if (open && telecallers.length > 0 && !selectedTelecallerId) {
      setSelectedTelecallerId(telecallers[0].id)
    }
  }, [open, telecallers, selectedTelecallerId])

  const handleAssign = async () => {
    if (!selectedTelecallerId || leads.length === 0) return
    
    setIsAssigning(true)
    
    try {
      // Prepare payload for multiple assignment
      const payload = {
        leadIds: leads.map(lead => lead.id),
        telecallerId: selectedTelecallerId
      }

      console.log('Assigning leads with payload:', payload)

      // Make API call to assign multiple leads
      const response = await apiClient.post("/leads/assign-multiple", payload)

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to assign leads")
      }

      const selectedTelecaller = telecallers.find(t => t.id === selectedTelecallerId)
      toast.success(`Successfully assigned ${leads.length} lead${leads.length > 1 ? 's' : ''} to ${selectedTelecaller?.name || 'telecaller'}`)
      
      // Invalidate leads query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      
      onUpdate()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Assignment failed:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to assign leads")
    } finally {
      setIsAssigning(false)
    }
  }

  const selectedTelecaller = telecallers.find(t => t.id === selectedTelecallerId)
  const isDisabled = !selectedTelecallerId || leads.length === 0 || isAssigning || isLoadingTelecallers

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Leads
          </DialogTitle>
          <DialogDescription>
            Select a telecaller to assign the selected leads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
            {/* Telecaller Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Select Telecaller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  {/* <Label htmlFor="telecaller-select">Choose telecaller</Label> */}
                  {isLoadingTelecallers ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading telecallers...
                    </div>
                  ) : telecallers.length > 0 ? (
                    <Select 
                      value={selectedTelecallerId} 
                      onValueChange={setSelectedTelecallerId}
                      disabled={isAssigning}
                    >
                      <SelectTrigger id="telecaller-select">
                        <SelectValue placeholder="Choose telecaller" />
                      </SelectTrigger>
                      <SelectContent>
                        {telecallers.map((telecaller) => (
                          <SelectItem key={telecaller.id} value={telecaller.id}>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {telecaller.name || telecaller.email || telecaller.id}
                              </span>
                              {telecaller.email && telecaller.name && (
                                <span className="text-xs text-muted-foreground">{telecaller.email}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-red-600 p-3 border rounded-md">
                      No telecallers available.
                    </div>
                  )}
                </div>

                {/* Selected Telecaller Info */}
                {/* {selectedTelecaller && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      selectedTelecaller.status === "active" ? "bg-green-500" : "bg-amber-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {selectedTelecaller.name || selectedTelecaller.email || selectedTelecaller.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {selectedTelecaller.status || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedTelecaller.status === "active" ? "Available" : "Busy"}
                    </Badge>
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>
          {/* Selected Leads Summary */}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Selected Leads ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Mobile</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Specialty</TableHead>
                      <TableHead className="text-xs">Language</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="text-xs font-medium">{lead.patientName}</TableCell>
                        <TableCell className="text-xs">{lead.phone || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{lead.email || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{lead.specialty_name || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{lead.language_name || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isDisabled}>
            {isAssigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Assign Leads
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
