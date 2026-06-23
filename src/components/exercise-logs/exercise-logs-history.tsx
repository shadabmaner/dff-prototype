import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Loader2, Dumbbell, TrendingUp, CheckCircle2, XCircle, Flame, Video, MapPin, Play, Clock, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useExerciseLogsHistory } from "@/hooks/use-exercise-logs"
import { motion } from "framer-motion"

interface ExerciseLogsHistoryProps {
  patientId: string
  startDate?: string
  endDate?: string
}

export function ExerciseLogsHistory({ patientId, startDate, endDate }: ExerciseLogsHistoryProps) {
  const [page, setPage] = useState(1)
  const limit = 20

  const decoded = startDate ? decodeURIComponent(startDate) : undefined
  const formattedStartDate = decoded?.split("T")[0]

  const { data, isLoading, isError } = useExerciseLogsHistory({
    patientId,
    page,
    limit,
    startDate: formattedStartDate,
    endDate,
  })

  // Data structure mapping from the new response
  const exerciseLogs = (data as any)?.data || []
  
  // Calculate analytics based on the new schema
  const totalDurationSeconds = exerciseLogs.reduce((sum: number, log: any) => sum + (log.duration_seconds || 0), 0)
  const totalDurationMins = Math.round(totalDurationSeconds / 60)
  const completedExercises = exerciseLogs.filter((log: any) => log.is_completed).length
  const completionRate = exerciseLogs.length > 0 ? Math.round((completedExercises / exerciseLogs.length) * 100) : 0
  const avgProgress = exerciseLogs.length > 0 
    ? Math.round(exerciseLogs.reduce((sum: number, log: any) => sum + (log.progress_percent || 0), 0) / exerciseLogs.length) 
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-rose-200 bg-rose-50/50">
        <CardContent className="py-8 text-center text-rose-600 font-medium">
          <XCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
          Failed to load patient exercise journey.
        </CardContent>
      </Card>
    )
  }

  if (exerciseLogs.length === 0) {
    return (
      <Card className="border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Dumbbell className="h-10 w-10 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900">No journey logs recorded</p>
          <p className="text-sm text-slate-500 max-w-xs mt-2">
            The patient hasn't started their exercise collection or logged any progress yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Metrics Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-indigo-400 mb-2 font-bold text-[10px] uppercase tracking-widest">
              Total Duration
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-900">{totalDurationMins}</span>
              <span className="text-sm font-medium text-indigo-600/60 uppercase tracking-tighter">mins</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-indigo-100/50 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-emerald-400 mb-2 font-bold text-[10px] uppercase tracking-widest">
              Completion
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-900">{completionRate}</span>
              <span className="text-sm font-medium text-emerald-600/60 uppercase tracking-tighter">%</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-emerald-600/70 uppercase">
              {completedExercises} OF {exerciseLogs.length} COMPLETED
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-blue-400 mb-2 font-bold text-[10px] uppercase tracking-widest">
              Avg. Progress
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-900">{avgProgress}</span>
              <span className="text-sm font-medium text-blue-600/60 uppercase tracking-tighter">%</span>
            </div>
            <p className="text-[10px] mt-2 text-blue-600/70 font-bold uppercase tracking-wide">Across all logged days</p>
          </CardContent>
        </Card>

        <Card className="border border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-orange-400 mb-2 font-bold text-[10px] uppercase tracking-widest">
              Latest Activity
              <Calendar className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-orange-900 truncate">
              {exerciseLogs[0] ? format(new Date(exerciseLogs[0].completed_at || exerciseLogs[0].last_accessed_at), "MMM d, yyyy") : "--"}
            </div>
            <p className="text-[10px] mt-2 text-orange-600/70 font-bold uppercase tracking-wide">Most recent log date</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Timeline */}
      <div className="space-y-4">
        {exerciseLogs.map((log: any, idx: number) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="overflow-hidden border-slate-200 group hover:border-indigo-400 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100">
              <div className="flex flex-col md:flex-row">
                <div className={`w-1.5 shrink-0 ${log.is_completed ? "bg-emerald-500" : "bg-orange-400"}`} />
                
                <CardContent className="p-6 flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-bold text-white text-xs">
                            {log.day_number}
                          </span>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                            {log.item_title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[10px] uppercase">
                            {log.collection_name}
                          </Badge>
                          {log.media_type && (
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-[10px] uppercase">
                              {log.media_type}
                            </Badge>
                          )}
                          {log.is_completed ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px] uppercase">
                              COMPLETED
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold text-[10px] uppercase">
                              IN PROGRESS
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex flex-wrap gap-x-8 gap-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                          <div className="flex items-center gap-2 font-bold text-slate-700">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            {Math.round(log.duration_seconds / 60)} mins
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed At</p>
                          <div className="flex items-center gap-2 font-bold text-slate-700">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            {log.completed_at ? format(new Date(log.completed_at), "PPP p") : "Not completed"}
                          </div>
                        </div>
                        <div className="space-y-1 flex-1 min-w-[200px]">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day Progress</p>
                            <p className="text-[10px] font-black text-indigo-600">{log.progress_percent}%</p>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                log.progress_percent === 100 ? "bg-emerald-500" : "bg-indigo-500"
                              }`} 
                              style={{ width: `${log.progress_percent}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Video Link */}
                      {log.media_url && (
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-4 border-slate-200 text-indigo-600 hover:bg-slate-50 font-bold"
                            onClick={() => window.open(log.media_url, '_blank')}
                          >
                            <Play className="h-3 w-3 mr-2" fill="currentColor" />
                            Watch Training Video
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination component */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
           Showing <span className="text-slate-900 tracking-normal">{exerciseLogs.length}</span> journey logs
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-bold border-slate-200 h-10"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-bold border-slate-200 h-10"
            onClick={() => setPage((p) => p + 1)}
            disabled={exerciseLogs.length < limit}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
