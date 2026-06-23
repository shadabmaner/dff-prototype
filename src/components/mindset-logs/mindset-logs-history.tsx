import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Loader2, Brain, Clock, FileText, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePatientMindsetLogs } from "@/hooks/use-patient"
import { cn } from "@/lib/utils"

interface MindsetLogsHistoryProps {
  patientId: string
  startDate?: string
  endDate?: string
}

export function MindsetLogsHistory({ patientId, startDate, endDate }: MindsetLogsHistoryProps) {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError } = usePatientMindsetLogs(patientId, {
    page,
    limit,
    start_date: startDate ? decodeURIComponent(startDate).split("T")[0] : undefined,
    end_date: endDate ? decodeURIComponent(endDate).split("T")[0] : undefined,
  })

  const mindsetLogs = data?.data?.logs || []
  const pagination = data?.data?.meta

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-slate-500">
        Failed to load mindset logs. Please try again.
      </div>
    )
  }

  if (mindsetLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
            <Brain className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-lg font-semibold text-slate-700">No mindset logs found</p>
        <p className="text-sm text-slate-500 mt-1">Patient hasn't logged any mindset activities yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {mindsetLogs.map((log: any, index: number) => (
          <div
            key={String(log.id) || `log-${index}`}
            className="p-6 transition-all hover:bg-slate-50/50 group bg-white"
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-white text-[12px] font-black text-purple-600 border-purple-200 px-2 uppercase tracking-tight py-0">
                    Day {log.day_number}
                  </Badge>
                  {log.logged_time && (
                    <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {log.logged_time}
                    </span>
                  )}
                </div>
                  {log?.day_title && (
                    <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
                      <span className="text-slate-400">Day Title:</span>
                      <span className="text-slate-600 font-bold">{typeof log.day_title === 'object' ? log.day_title.en || log.day_title.mr || JSON.stringify(log.day_title) : log.day_title}</span>
                    </p>
                  )}
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <span className="text-slate-400">Plan:</span>
                  <span className="text-slate-600 font-bold">{typeof log.plan_name === 'object' ? log.plan_name.en || log.plan_name.mr || JSON.stringify(log.plan_name) : log.plan_name}</span>
                </p>

              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge className={cn(
                  "font-bold px-2 py-0.5 text-[10px] uppercase tracking-tighter border-0",
                  log.status === 'completed' ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100" : "bg-purple-500 text-white"
                )}>
                  {log.status}
                </Badge>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-md">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {new Date(log.logged_date || log.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 transition-all border-l-4 border-l-purple-500">

              <div className="space-y-4">
                {log.activity_prompt && <div className="mb-2"><span className="text-sm font-medium">Question: </span><span className="text-slate-700 italic truncate text-sm pb-4">{typeof log.activity_prompt === 'object' ? log.activity_prompt.en || log.activity_prompt.mr || JSON.stringify(log.activity_prompt) : log.activity_prompt}</span></div>}
                {log.activity_type === 'quiz_item' ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Evaluation Score</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={cn(
                              "h-3 w-3 rounded-full transition-all duration-300",
                              star <= (log.response?.value || 0)
                                ? "bg-purple-600 shadow-sm scale-110"
                                : "bg-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-purple-700 leading-none">{log.response?.value}</span>
                        <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">/ 5 Score</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Response</p>
                    <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200 relative shadow-sm">
                      <div className="absolute top-2 right-2 opacity-5">
                        <FileText className="h-8 w-8 text-slate-900" />
                      </div>
                      <p className="text-sm text-slate-900 font-bold italic leading-relaxed relative z-10">
                        "{typeof log.response?.answer === 'object' ? log.response?.answer.en || log.response?.answer.mr || JSON.stringify(log.response?.answer) : log.response?.answer || "No text provided"}"
                      </p>
                    </div>
                  </div>
                )}

                {(log.notes || log.files?.length > 0) && (
                  <div className="grid gap-3 pt-3 border-t border-slate-100">
                    {log.notes && (
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" /> Dietitian Observations
                        </p>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {typeof log.notes === 'object' ? log.notes.en || log.notes.mr || JSON.stringify(log.notes) : log.notes}
                        </p>
                      </div>
                    )}

                    {log.files?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {log.files.map((file: any, fi: number) => (
                          <div key={`file-${fi}-${String(file.id || fi)}`} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-[10px] font-bold cursor-pointer hover:bg-blue-100 transition-colors">
                            <FileText className="h-3 w-3" />
                            Attached Material {fi + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border-slate-200 text-slate-600"
        >
          Previous
        </Button>
        <span className="text-sm text-slate-600 font-bold">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!pagination || page >= pagination.pages}
          className="border-slate-200 text-slate-600"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
