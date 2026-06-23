"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Info } from "lucide-react"
import { toast } from "sonner"

interface MondayCalendarPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMonday: (date: Date) => void
  patientName?: string
  isLoading?: boolean
}

const getNextMondays = () => {
  const today = new Date()
  const mondays: Date[] = []
  
  // Get day of week in local time (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = today.getDay()
  
  // If today is Monday (1), skip to next Monday (7 days later)
  const daysUntilMonday = dayOfWeek === 1 ? 7 : (dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7)
  
  // Calculate this Monday
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() + daysUntilMonday)
  thisMonday.setHours(0, 0, 0, 0)
  mondays.push(thisMonday)
  
  // Find next Monday
  const nextMonday = new Date(thisMonday)
  nextMonday.setDate(thisMonday.getDate() + 7)
  mondays.push(nextMonday)
  
  // Find third Monday
  const thirdMonday = new Date(nextMonday)
  thirdMonday.setDate(nextMonday.getDate() + 7)
  mondays.push(thirdMonday)
  
  return mondays
}

export function MondayCalendarPicker({
  open,
  onOpenChange,
  onSelectMonday,
  patientName,
  isLoading = false
}: MondayCalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const mondays = getNextMondays()

  useEffect(() => {
    if (open && !selectedDate) {
      setSelectedDate(mondays[0])
    }
    if (!open) {
      setSelectedDate(undefined)
    }
  }, [open]) // Remove selectedDate and mondays from dependencies to avoid loop if selectedDate changes
  const isMonday = (date: Date) => {
    return mondays.some(monday =>
      monday.getFullYear() === date.getFullYear() &&
      monday.getMonth() === date.getMonth() &&
      monday.getDate() === date.getDate()
    )
  }

  const handleConfirm = () => {
    if (!selectedDate) {
      toast.error("Please select a Monday to start the diet plan")
      return
    }
    
    if (!isMonday(selectedDate)) {
      toast.error("Diet plans can only start on Mondays")
      return
    }

    onSelectMonday(selectedDate)
    // Don't close dialog immediately - let parent handle it after operation completes
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isSameUTCDay = (date1: Date | undefined, date2: Date) => {
    if (!date1) return false
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // Prevent closing during loading
      if (isLoading) return
      onOpenChange(open)
    }}>
      <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Diet Plan Start Date
          </DialogTitle>
          <DialogDescription>
            {patientName ? `Choose a Monday to start ${patientName}'s diet plan cycle` : "Choose a Monday to start the diet plan cycle"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900">Diet plans must start on Monday</p>
              <p className="text-xs text-blue-700">
                This ensures proper cycle tracking and consistency. Only Mondays are selectable in the calendar.
              </p>
            </div>
          </div>

          {/* Quick Select Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Quick Select:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  if (!isLoading) {
                    setSelectedDate(mondays[0])
                  }
                }}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSameUTCDay(selectedDate, mondays[0])
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-emerald-600 text-white">This Monday</Badge>
                  {isSameUTCDay(selectedDate, mondays[0]) && (
                    <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatDate(mondays[0])}</p>
                <p className="text-xs text-slate-600 mt-1">Start immediately</p>
              </button>

              <button
                onClick={() => setSelectedDate(mondays[1])}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSameUTCDay(selectedDate, mondays[1])
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-slate-300 text-slate-700">Next Monday</Badge>
                  {isSameUTCDay(selectedDate, mondays[1]) && (
                    <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatDate(mondays[1])}</p>
                <p className="text-xs text-slate-600 mt-1">Start next week</p>
              </button>
              <button
                onClick={() => setSelectedDate(mondays[2])}
                disabled={isLoading}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSameUTCDay(selectedDate, mondays[2])
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-slate-300 text-slate-700">Third Monday</Badge>
                  {isSameUTCDay(selectedDate, mondays[2]) && (
                    <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatDate(mondays[2])}</p>
                <p className="text-xs text-slate-600 mt-1">Start in 2 weeks</p>
              </button>
            </div>
          </div>

          {/* Calendar View */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Or select from calendar:</p>
            <div className="flex justify-center p-4 border border-slate-200 rounded-lg bg-slate-50">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !isMonday(date)}
                className="rounded-md border-0"
              />
            </div>
          </div>

          {/* Diet Cycle Info */}
          {selectedDate && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">Diet Plan Cycle Schedule:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Cycle 1 (8 days):</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(selectedDate)} - {formatDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cycle 2 (15 days):</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(new Date(selectedDate.getTime() + 8 * 24 * 60 * 60 * 1000))} - {formatDate(new Date(selectedDate.getTime() + 22 * 24 * 60 * 60 * 1000))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cycles 3-6 (15 days each):</span>
                  <span className="font-semibold text-slate-900">Continue every 15 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cycle 7 (7 days):</span>
                                    <span className="font-semibold text-slate-900">Last Phase</span>

                </div>
                <div className="pt-2 mt-2 border-t border-slate-300 flex justify-between">
                  <span className="text-slate-600">Total Duration:</span>
                  <span className="font-semibold text-slate-900">90 days (approx. 13 weeks)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="border-slate-300 text-slate-700 hover:bg-slate-50">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || isLoading}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Starting...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Confirm & Start Diet Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
