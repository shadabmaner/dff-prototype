"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableLeadCardProps {
  lead: {
    lead_id: string
    lead_name?: string
    caller_id: string
    expires_at: string
  }
  isDragging?: boolean
}

export function DraggableLeadCard({ lead, isDragging }: DraggableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: lead.lead_id,
    data: {
      lead,
    },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      {...listeners}
      {...attributes}
    >
      <Card className={cn(
        "hover:shadow-md transition-shadow border-l-4 border-l-blue-500",
        isDragging && "shadow-lg rotate-2"
      )}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center mt-1">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lead.lead_name || 'Unnamed Lead'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(lead.expires_at).toLocaleDateString()}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Drag to reassign
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
