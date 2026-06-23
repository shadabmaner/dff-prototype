"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, Clock, Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseLogsCardProps {
  isLoadingCollectionProgress: boolean;
  exerciseLogs: any[];
}

export function ExerciseLogsCard({ isLoadingCollectionProgress, exerciseLogs }: ExerciseLogsCardProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Exercise Logs</h2>
        </div>
        {isLoadingCollectionProgress ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : exerciseLogs.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {exerciseLogs.map((log: any, index: number) => (
              <div key={log.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden">
                {log.is_completed && (
                  <div className="absolute top-0 right-0 p-1">
                    <div className="bg-emerald-500 text-white p-0.5 rounded-bl-lg">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                      {log.collection_name} {log.day_number ? `• Day ${log.day_number}` : ''}
                    </p>
                    <p className="font-bold text-slate-800 leading-tight">{log.title || "Exercise Session"}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize ml-2",
                      log.is_completed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                    )}
                  >
                    {log.is_completed ? 'Completed' : 'Unlocked'}
                  </Badge>
                </div>
                {log.notes && (
                  <p className="text-sm text-slate-600 mb-2">{log.notes}</p>
                )}
                <div className="flex gap-4 text-[10px] text-slate-500 flex-wrap">
                  {(log.completed_at || log.unlocked_at || log.created_at) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {log.is_completed ? 'Completed: ' : 'Unlocked: '}
                      {new Date(log.completed_at || log.unlocked_at || log.created_at).toLocaleDateString()}
                    </div>
                  )}
                  {(log.duration || log.duration_mins) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.duration || log.duration_mins} mins
                    </div>
                  )}
                  {log.progress_percent !== undefined && (
                    <div className="flex items-center gap-1 font-medium text-slate-600">
                      <Activity className="h-3 w-3" />
                      Progress {log.progress_percent}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Dumbbell className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No exercise logs found for this patient.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
