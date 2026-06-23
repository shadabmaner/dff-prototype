"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Calendar, FileText, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface MindsetLogsCardProps {
  mindsetLogs: any;
}

export function MindsetLogsCard({ mindsetLogs }: MindsetLogsCardProps) {
  return (
    <Card className="border-0 bg-white shadow-xl overflow-hidden rounded-2xl ring-1 ring-slate-200/50">
      <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Mindset Journey Logs</CardTitle>
              <p className="text-[11px] text-slate-500 font-medium font-outfit mt-0.5">Comprehensive tracking of patient reflections and mindset activities</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
            {mindsetLogs?.data?.logs?.length || 0} Entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {mindsetLogs?.data?.logs?.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
            {mindsetLogs.data?.logs.map((log: any, index: number) => (
              <div key={log.id || index} className="p-6 transition-all hover:bg-slate-50/30 group">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-white text-[9px] font-black text-purple-600 border-purple-200 px-2 uppercase tracking-tight py-0">
                        {log.activity_type?.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Day {log.day_number}
                      </span>
                      {log.logged_time && (
                        <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {log.logged_time}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight text-sm">
                      {log.activity_prompt?.split('$')[0] || log.day_title || "Mindset Exercise"}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <span className="text-slate-400">Plan:</span>
                      <span className="text-slate-600 font-bold">{log.plan_name}</span>
                      {log.day_title && <span className="text-slate-300 mx-1">|</span>}
                      {log.day_title && <span className="text-slate-500 italic truncate max-w-[200px]">{log.day_title}</span>}
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

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-all border-l-4 border-l-purple-500">
                  <div className="space-y-4">
                    {log.activity_type === 'quiz_item' ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Evaluation Score</p>
                        <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100">
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Reflection</p>
                        <div className="bg-slate-50/80 p-4 rounded-xl border border-dashed border-slate-200 relative">
                          <div className="absolute top-2 right-2 opacity-10">
                            <FileText className="h-8 w-8 text-slate-900" />
                          </div>
                          <p className="text-sm text-slate-900 font-bold italic leading-relaxed relative z-10">
                            "{log.response?.answer || "No text provided"}"
                          </p>
                        </div>
                      </div>
                    )}

                    {(log.notes || log.files?.length > 0) && (
                      <div className="grid gap-3 pt-3 border-t border-slate-100">
                        {log.notes && (
                          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <ClipboardList className="h-3 w-3" /> Dietitian Observations
                            </p>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                              {log.notes}
                            </p>
                          </div>
                        )}

                        {log.files?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {log.files.map((file: any, fi: number) => (
                              <div key={fi} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-[10px] font-bold cursor-pointer hover:bg-blue-100 transition-colors">
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
        ) : (
          <div className="text-center py-24 bg-slate-50/30">
            <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 border border-slate-100 rotate-3">
              <Brain className="h-10 w-10 text-slate-200 -rotate-3" />
            </div>
            <h4 className="text-slate-800 font-bold text-lg">No Mindfulness Data</h4>
            <p className="text-sm text-slate-400 mt-2 max-w-[240px] mx-auto font-medium">
              We'll display the patient's mindset activities and scores as they are logged.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
