"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { DraggableLeadCard } from "./draggable-lead-card"

interface TelecallerDropZoneProps {
  telecaller: {
    id: string
    name?: string
    email?: string
    status?: string
  }
  leads: Array<{
    lead_id: string
    lead_name?: string
    caller_id: string
    expires_at: string
    telecaller_name?: string
  }>
  isOver?: boolean
  onReassign?: (leadId: string, newCallerId: string) => void
}

export function TelecallerDropZone({ telecaller, leads, isOver, onReassign }: TelecallerDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: telecaller.id,
    data: {
      telecaller,
    },
  })

  const isActive = (telecaller.status ?? "active") === "active"
  // Try to get telecaller name from any of the leads assigned to this telecaller
  const leadWithName = leads.find(lead => lead.telecaller_name?.trim())
  const displayName = leadWithName?.telecaller_name?.trim() || telecaller.name?.trim() || telecaller.email?.trim() || 'Unknown Telecaller'

  return (
    <Card className={cn(
      "transition-all duration-200",
      isOver && "ring-2 ring-blue-500 bg-blue-50/50"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isActive ? "bg-green-500" : "bg-amber-500"
            )} />
            <span>{displayName}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {leads.length} leads
          </Badge>
        </CardTitle>
        {telecaller.email && (
          <p className="text-xs text-muted-foreground">{telecaller.email}</p>
        )}
      </CardHeader>
      <CardContent 
        ref={setNodeRef}
        className={cn(
          "min-h-[200px] space-y-2 transition-colors",
          isOver && "bg-blue-100/30 rounded-lg"
        )}
      >
        {leads.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg transition-colors",
            isOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          )}>
            {isOver ? (
              <>
                <ArrowDown className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-blue-700">Drop lead here</p>
              </>
            ) : (
              <>
                <UserPlus className="h-8 w-8 mb-2" />
                <p className="text-sm">No leads assigned</p>
                <p className="text-xs">Drag leads here to assign</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <DraggableLeadCard
                key={lead.lead_id}
                lead={lead}
              />
            ))}
            {isOver && (
              <div className="flex items-center justify-center h-16 text-blue-600 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
                <ArrowDown className="h-6 w-6 mr-2" />
                <span className="text-sm font-medium">Drop to reassign</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
