"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Clock, Activity } from "lucide-react";

interface SalesCallLogsCardProps {
  isLoadingPatient: boolean;
  patientClinicalData: any;
}

export function SalesCallLogsCard({ isLoadingPatient, patientClinicalData }: SalesCallLogsCardProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <PhoneCall className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sales Call Logs</h2>
        </div>
        {isLoadingPatient ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-xl p-5 bg-gradient-to-br from-slate-50 to-gray-50">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/4 mb-3" />
                <div className="grid gap-3 md:grid-cols-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : patientClinicalData?.data?.call_logs && patientClinicalData.data.call_logs.length > 0 ? (
          <div className="space-y-4">
            {patientClinicalData.data.call_logs.map((log: any) => (
              <div key={log.id} className="rounded-xl p-5 bg-gradient-to-br from-slate-50 to-gray-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{log.caller_name || log.telecaller_name || "Telecaller"}</p>
                    <p className="text-xs text-slate-500">{log.direction === "outbound" ? "Outbound" : "Inbound"} • {log.phone}</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                    {log.status}
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    {new Date(log.called_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Activity className="h-4 w-4" />
                    {Math.round((log.duration_seconds || 0) / 60)} mins
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 capitalize">
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                      {({
                        connected: "Connected",
                        not_connected: "Not Connected",
                        interested: "Interested",
                        not_interested: "Not Interested",
                        follow_up_required: "Follow-up Required",
                      } as Record<string, string>)[String(log.outcome ?? "")] || log.outcome?.replace(/_/g, " ") || "No outcome"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-full">
                    Status: {({
                      connected: "Connected",
                      missed: "Missed",
                      failed: "Failed",
                      not_connected: "Not Connected",
                    } as Record<string, string>)[String(log.status ?? "")] || log.status?.replace(/_/g, " ") || "Unknown"}
                  </span>
                  {log.notes && (
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-full">
                      Notes: {log.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PhoneCall className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No call logs recorded yet</p>
            <p className="text-sm text-slate-500">Sales call activity will appear here once available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
