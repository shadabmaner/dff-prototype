import { useState } from "react"
import { UtensilsCrossed, Dumbbell, Brain, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MealLogsHistory } from "@/components/meal-logs/meal-logs-history"
import { ExerciseLogsHistory } from "@/components/exercise-logs/exercise-logs-history"
import { MindsetLogsHistory } from "@/components/mindset-logs/mindset-logs-history"
import { DatePicker } from "@/components/CalenderPicker"
import { format, subDays, addDays, startOfDay } from "date-fns"

interface PatientLogsTabsProps {
  patientId: string
  minDate?: string
  maxDate?: string
  joiningDate?: string // Keep for backward compat or if needed, but we'll prioritize minDate
  startDate?: string
  endDate?: string
}

export function PatientLogsTabs({ patientId, minDate, maxDate, joiningDate }: PatientLogsTabsProps) {
  const [activeTab, setActiveTab] = useState<"meals" | "exercises" | "mindset">("meals")
  const [showCalendar, setShowCalendar] = useState(false)

  // Initialize to joiningDate if provided, otherwise minDate, otherwise today
  const getInitialDate = () => {
    const joining = joiningDate ? startOfDay(new Date(joiningDate)) : null
    const min = minDate ? startOfDay(new Date(minDate)) : null
    const max = maxDate ? startOfDay(new Date(maxDate)) : null
    const today = startOfDay(new Date())

    // Use joiningDate as initial date if provided
    if (joining) return joining
    
    // Otherwise use minDate if provided
    if (min) return min
    
    // Otherwise use today, clamped to max if needed
    if (max && today > max) return max
    return today
  }

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate())

  const parsedMinDate = minDate ? startOfDay(new Date(minDate)) : null
  const parsedMaxDate = maxDate ? startOfDay(new Date(maxDate)) : null

  const handlePrevDay = () => {
    if (parsedMinDate && selectedDate <= parsedMinDate) return
    setSelectedDate(prev => subDays(prev, 1))
  }
  const handleNextDay = () => {
    if (parsedMaxDate && selectedDate >= parsedMaxDate) return
    setSelectedDate(prev => addDays(prev, 1))
  }
  const handleToday = () => {
    const today = startOfDay(new Date())
    if (parsedMinDate && today < parsedMinDate) return
    if (parsedMaxDate && today > parsedMaxDate) return
    setSelectedDate(today)
  }

  const canGoPrev = !parsedMinDate || selectedDate > parsedMinDate
  const canGoNext = !parsedMaxDate || selectedDate < parsedMaxDate

  const dateString = format(selectedDate, "yyyy-MM-dd")

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            Patient Activity Logs
            <Badge variant="outline" className="ml-2 font-black text-[10px] uppercase border-slate-300">
                Daily Mode
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm self-start md:self-auto">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${!canGoPrev ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
              onClick={handlePrevDay}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-3 py-1 border-x border-slate-100 hover:bg-slate-50 rounded transition-colors"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  {format(selectedDate, "PPP")}
                </span>
              </button>

              {showCalendar && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                    <DatePicker
                      value={selectedDate}
                      onChange={(date) => {
                        if (date) {
                          const newDate = startOfDay(date)
                          if (parsedMinDate && newDate < parsedMinDate) return
                          if (parsedMaxDate && newDate > parsedMaxDate) return
                          setSelectedDate(newDate)
                        }
                        setShowCalendar(false)
                      }}
                      placeholder="Select date"
                      className="w-full"
                      defaultOpen={true}
                      disabled={(date:any) => {
                        const d = startOfDay(date)
                        if (parsedMinDate && d < parsedMinDate) return true
                        if (parsedMaxDate && d > parsedMaxDate) return true
                        return false
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${!canGoNext ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
              onClick={handleNextDay}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className={`h-8 px-3 text-[10px] font-black uppercase bg-slate-900 text-white hover:bg-slate-800 rounded-lg ml-1 ${
                (parsedMinDate && startOfDay(new Date()) < parsedMinDate) ||
                (parsedMaxDate && startOfDay(new Date()) > parsedMaxDate)
                ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={handleToday}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setActiveTab("meals")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "meals"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Meal Logs</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("exercises")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "exercises"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span>Exercise Logs</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("mindset")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "mindset"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Mindset Logs</span>
            </div>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {activeTab === "meals" && (
          <MealLogsHistory
            patientId={patientId}
            startDate={dateString}
            endDate={dateString}
          />
        )}
        {activeTab === "exercises" && (
          <ExerciseLogsHistory
            patientId={patientId}
            startDate={dateString}
            endDate={dateString}
          />
        )}
        {activeTab === "mindset" && (
          <MindsetLogsHistory
            patientId={patientId}
            startDate={dateString}
            endDate={dateString}
          />
        )}
      </CardContent>
    </Card>
  )
}
