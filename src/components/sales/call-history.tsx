"use client"

import * as React from "react"
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, User, Calendar, MessageCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { getCallHistory, type CallHistoryRecord } from "@/lib/api/call-history"

interface CallHistoryProps {
  leadId: string;
}

function groupCallsByDate(calls: CallHistoryRecord[]) {
  const groups: Record<string, CallHistoryRecord[]> = {}
  calls.forEach((call) => {
    const date = new Date(call.calledAt)
    const dateKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(call)
  })
  return groups
}

const statusConfig: Record<string, { label: string; className: string }> = {
  connected: { label: "Connected", className: "bg-green-100 text-green-800" },
  missed: { label: "Missed", className: "bg-red-100 text-red-800" },
  failed: { label: "Failed", className: "bg-gray-100 text-gray-800" },
}

const statusLabels: Record<string, string> = {
  connected: "Connected",
  missed: "Missed",
  failed: "Failed",
  not_connected: "Not Connected",
}

const outcomeConfig: Record<string, { label: string; className: string }> = {
  interested: { label: "Interested", className: "bg-emerald-100 text-emerald-800" },
  not_interested: { label: "Not Interested", className: "bg-red-100 text-red-800" },
  follow_up_required: { label: "Follow Up Required", className: "bg-amber-100 text-amber-800" },
  voicemail: { label: "Voicemail", className: "bg-blue-100 text-blue-800" },
  wrong_number: { label: "Wrong Number", className: "bg-slate-100 text-slate-800" },
}

const directionConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  inbound: { icon: <PhoneIncoming className="h-4 w-4" />, label: "Inbound" },
  outbound: { icon: <PhoneOutgoing className="h-4 w-4" />, label: "Outbound" },
}

export function CallHistory({ leadId }: CallHistoryProps) {
  const [calls, setCalls] = React.useState<CallHistoryRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        setLoading(true);
        const response = await getCallHistory(leadId);
        setCalls(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load call history");
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, [leadId]);

  const groupedCalls = groupCallsByDate(calls)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-medium">Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground font-medium">Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600">Error loading call history: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12">
        <Phone className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-900">No call history</p>
        <p className="text-xs text-slate-500 mt-1">No calls have been recorded for this lead yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedCalls).map(([date, dateCalls]) => (
        <div key={date} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{date}</h3>
          </div>

          {/* Calls for this date */}
          <div className="ml-4 pl-4 border-l-2 border-slate-200 space-y-3">
            {dateCalls.map((call) => {
              const status = statusConfig[call.status] ?? { label: call.status, className: "bg-gray-100 text-gray-800" };
              const outcome = outcomeConfig[call.outcome] ?? { label: call.outcome, className: "bg-gray-100 text-gray-800" };
              const direction = directionConfig[call.direction] ?? { icon: <Phone className="h-4 w-4" />, label: call.direction };

              return (
                <div key={call.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[22px] top-3 h-3 w-3 rounded-full bg-white border-2 border-blue-500 shadow-sm"></div>

                  {/* Call Card */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            call.direction === 'inbound' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {direction.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {call.direction === 'inbound' ? 'Incoming Call' : 'Outgoing Call'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {call.telecallerName} contacted {call.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-xs ${status.className}`}>{status.label}</Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {call.durationFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    {call.notes && (
                      <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed">{call.notes}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                      <Badge className={`text-xs ${outcome.className}`}>{outcome.label}</Badge>
                      {call.followUpDate && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          Follow-up: {formatDate(call.followUpDate, "MMM dd")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        Status: {statusLabels[call.status] || call.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
