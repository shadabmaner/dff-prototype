"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Clock, TrendingUp } from "lucide-react"

interface DietCycle {
  cycle: number
  duration: number
  startDate: Date
  endDate: Date
  status: "completed" | "active" | "upcoming"
}

interface DietPlanCycleTrackerProps {
  startDate: Date
  currentDate?: Date
}

export function DietPlanCycleTracker({ startDate, currentDate = new Date() }: DietPlanCycleTrackerProps) {
  const calculateCycles = (): DietCycle[] => {
    const cycles: DietCycle[] = []
    let currentStartDate = new Date(startDate)

    // Cycle 1: 8 days
    const cycle1End = new Date(currentStartDate)
    cycle1End.setDate(cycle1End.getDate() + 7)
    cycles.push({
      cycle: 1,
      duration: 8,
      startDate: new Date(currentStartDate),
      endDate: cycle1End,
      status: currentDate > cycle1End ? "completed" : currentDate >= currentStartDate ? "active" : "upcoming"
    })

    // Cycles 2-6: 15 days each
    currentStartDate = new Date(cycle1End)
    currentStartDate.setDate(currentStartDate.getDate() + 1)

    for (let i = 2; i <= 6; i++) {
      const cycleEnd = new Date(currentStartDate)
      cycleEnd.setDate(cycleEnd.getDate() + 14)
      
      cycles.push({
        cycle: i,
        duration: 15,
        startDate: new Date(currentStartDate),
        endDate: cycleEnd,
        status: currentDate > cycleEnd ? "completed" : currentDate >= currentStartDate ? "active" : "upcoming"
      })

      currentStartDate = new Date(cycleEnd)
      currentStartDate.setDate(currentStartDate.getDate() + 1)
    }

    return cycles
  }

  const cycles = calculateCycles()
  const activeCycle = cycles.find(c => c.status === "active")
  const completedCycles = cycles.filter(c => c.status === "completed").length
  const totalProgress = (completedCycles / cycles.length) * 100

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDaysRemaining = (endDate: Date) => {
    const diff = endDate.getTime() - currentDate.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getCycleProgress = (cycle: DietCycle) => {
    if (cycle.status === "completed") return 100
    if (cycle.status === "upcoming") return 0
    
    const totalDuration = cycle.endDate.getTime() - cycle.startDate.getTime()
    const elapsed = currentDate.getTime() - cycle.startDate.getTime()
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Diet Plan Progress</h3>
              <p className="text-sm text-slate-600 mt-1">
                {completedCycles} of {cycles.length} cycles completed
              </p>
            </div>
            <Badge className="bg-slate-900 text-white">
              {Math.round(totalProgress)}%
            </Badge>
          </div>
          
          <Progress value={totalProgress} className="h-3 mb-4" />
          
          {activeCycle && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-600" />
              <span className="text-slate-700">
                <strong>Cycle {activeCycle.cycle}</strong> - {getDaysRemaining(activeCycle.endDate)} days remaining
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cycle Timeline */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cycle Timeline</h3>
          
          <div className="space-y-3">
            {cycles.map((cycle, index) => (
              <div key={cycle.cycle} className="relative">
                {/* Connector Line */}
                {index < cycles.length - 1 && (
                  <div className="absolute left-[15px] top-[40px] w-0.5 h-[calc(100%+12px)] bg-slate-200" />
                )}
                
                <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                  cycle.status === "active" 
                    ? "border-slate-900 bg-slate-50" 
                    : cycle.status === "completed"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-white"
                }`}>
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    cycle.status === "completed"
                      ? "bg-emerald-600"
                      : cycle.status === "active"
                      ? "bg-slate-900"
                      : "bg-slate-200"
                  }`}>
                    {cycle.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : cycle.status === "active" ? (
                      <TrendingUp className="h-5 w-5 text-white" />
                    ) : (
                      <Calendar className="h-4 w-4 text-slate-500" />
                    )}
                  </div>

                  {/* Cycle Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">Cycle {cycle.cycle}</h4>
                        <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                          {cycle.duration} Days
                        </Badge>
                        {cycle.status === "active" && (
                          <Badge className="text-xs bg-slate-900 text-white">
                            Active
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-600">
                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                      </span>
                    </div>

                    {/* Progress Bar for Active Cycle */}
                    {cycle.status === "active" && (
                      <div className="space-y-1">
                        <Progress value={getCycleProgress(cycle)} className="h-2" />
                        <p className="text-xs text-slate-600">
                          {getDaysRemaining(cycle.endDate)} days remaining
                        </p>
                      </div>
                    )}

                    {cycle.status === "completed" && (
                      <p className="text-xs text-emerald-700 font-medium">
                        ✓ Completed successfully
                      </p>
                    )}

                    {cycle.status === "upcoming" && (
                      <p className="text-xs text-slate-500">
                        Starts on {formatDate(cycle.startDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedCycles}</p>
                <p className="text-xs text-slate-600 mt-1">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeCycle ? 1 : 0}</p>
                <p className="text-xs text-slate-600 mt-1">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {cycles.filter(c => c.status === "upcoming").length}
                </p>
                <p className="text-xs text-slate-600 mt-1">Upcoming</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
