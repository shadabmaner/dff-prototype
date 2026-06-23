"use client"

import * as React from "react"
import { Loader2, Phone, Clock, Calendar, MessageSquare, User } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCallHistory, type CallHistoryRecord } from "@/hooks/use-call-history"
import { formatDate } from "@/lib/utils"

interface CallHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadName: string
}

const outcomeConfig: Record<string, { label: string; className: string }> = {
  interested: { label: "Interested", className: "bg-green-100 text-green-800" },
  not_interested: { label: "Not Interested", className: "bg-red-100 text-red-800" },
  follow_up_required: { label: "Follow Up Required", className: "bg-blue-100 text-blue-800" },
  voicemail: { label: "Voicemail", className: "bg-gray-100 text-gray-800" },
  wrong_number: { label: "Wrong Number", className: "bg-red-100 text-red-800" },
}

export function CallHistoryDialog({ open, onOpenChange, leadId, leadName }: CallHistoryDialogProps) {
  const [page, setPage] = React.useState(1)
  const { data, isLoading, error } = useCallHistory(leadId, { 
    page, 
    limit: 20, 
    enabled: open 
  })

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (data?.meta && page < data.meta.totalPages) {
      setPage(page + 1)
    }
  }

  React.useEffect(() => {
    if (open) {
      setPage(1)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call History - {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading call history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">Failed to load call history</p>
              <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No call history found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">This lead hasn't been contacted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.data?.map((entry: CallHistoryRecord) => {
                const outcome = outcomeConfig[entry.outcome] || {
                  label: entry.outcome,
                  className: "bg-gray-100 text-gray-800"
                }

                return (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{leadName}</span>
                            <Badge className={outcome.className}>
                              {outcome.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            {entry.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.calledAt, "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.calledAt, "HH:mm")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duration: {entry.durationFormatted}
                      </div>
                      {entry.followUpDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Follow-up: {formatDate(entry.followUpDate, "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>

                    {entry.notes && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium text-gray-700">Notes</span>
                        </div>
                        <p className="text-sm text-gray-800">{entry.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Call by {entry.telecallerName}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Pagination */}
              {data?.meta?.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data?.meta?.total || 0)} of {data?.meta?.total || 0} calls
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page >= (data?.meta?.totalPages || 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
