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
  interested: { label: "Interested", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  not_interested: { label: "Not Interested", className: "bg-rose-100 text-rose-800 border-rose-200" },
  follow_up_required: { label: "Follow-up Required", className: "bg-amber-100 text-amber-800 border-amber-200" },
  converted: { label: "Converted", className: "bg-teal-100 text-teal-800 border-teal-200" },
  connected: { label: "Connected", className: "bg-blue-100 text-blue-800 border-blue-200" },
  voicemail: { label: "Voicemail", className: "bg-purple-100 text-purple-800 border-purple-200" },
  busy: { label: "Busy", className: "bg-orange-100 text-orange-800 border-orange-200" },
  wrong_number: { label: "Wrong Number", className: "bg-slate-100 text-slate-800 border-slate-200" },
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
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-hidden rounded-3xl p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
              <div className="p-2 rounded-xl bg-blue-50 text-[#1F56A3]">
                <Phone className="h-5 w-5" />
              </div>
              Call History Timeline & Status
            </DialogTitle>
            <Badge variant="outline" className="text-xs bg-slate-50 font-medium text-slate-700">
              Lead: {leadName}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detailed log of calls made to this patient including telecaller name, status, duration, follow-up, and notes.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 max-h-[62vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#1F56A3]" />
              <span className="ml-2.5 text-sm font-medium text-slate-600">Loading call history logs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-red-600">Failed to load call history</p>
              <p className="text-xs text-slate-400 mt-1">{(error as Error).message}</p>
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900">No call history recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">This lead has not received calls yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.data?.map((entry: CallHistoryRecord) => {
                const outcome = outcomeConfig[entry.outcome] || {
                  label: entry.outcome.replace(/_/g, " "),
                  className: "bg-slate-100 text-slate-800 border-slate-200"
                }
                const isOutbound = entry.direction === "outbound"

                return (
                  <div key={entry.id} className="border border-slate-200/90 rounded-2xl p-4 bg-white/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOutbound ? "bg-blue-50 text-[#1F56A3]" : "bg-amber-50 text-amber-600"}`}>
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{leadName}</span>
                            <Badge className={`${outcome.className} border text-[11px] font-semibold capitalize px-2 py-0.5`}>
                              {outcome.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] text-slate-500 capitalize">
                              {entry.direction}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {entry.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-800">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(entry.calledAt, "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {formatDate(entry.calledAt, "HH:mm")}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-100 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 text-[#1F56A3]" />
                        Duration: <span className="font-bold text-slate-900">{entry.durationFormatted}</span>
                      </div>
                      {entry.followUpDate ? (
                        <div className="flex items-center gap-1.5 font-medium text-amber-700">
                          <Calendar className="h-3.5 w-3.5 text-amber-600" />
                          Follow-up Scheduled: <span className="font-bold">{formatDate(entry.followUpDate, "MMM dd, yyyy")}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">• No immediate callback requested</span>
                      )}
                      {entry.leadStageAtCall && (
                        <div className="ml-auto text-[11px] text-slate-500">
                          Stage at call: <span className="font-semibold text-slate-700">{entry.leadStageAtCall}</span>
                        </div>
                      )}
                    </div>

                    {entry.notes && (
                      <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/80">
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-700">
                          <MessageSquare className="h-3.5 w-3.5 text-[#1F56A3]" />
                          Call Notes & Outcome Feedback
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700">{entry.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Caller: <span className="font-semibold text-slate-800">{entry.telecallerName || "Telecaller"}</span>
                        {entry.telecallerPhone && <span className="text-slate-400">({entry.telecallerPhone})</span>}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium">Status: {entry.status}</span>
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
