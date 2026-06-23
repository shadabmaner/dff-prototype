"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type TimePickerProps = {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
  id?: string
  interval?: number
  selectedDate?: Date
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  id,
  interval = 5,
  selectedDate,
}: TimePickerProps) {
  const [time, setTime] = React.useState<string>(value || "")
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"hour" | "minute">("hour")
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = React.useMemo(() => {
    const minuteOptions = []
    for (let i = 0; i < 60; i += interval) {
      minuteOptions.push(i.toString().padStart(2, '0'))
    }
    return minuteOptions
  }, [interval])

  const [selectedHour, setSelectedHour] = React.useState(
    value ? value.split(':')[0] : '09'
  )
  const [selectedMinute, setSelectedMinute] = React.useState(
    value ? value.split(':')[1] : '00'
  )

  const hasSelectedDate = !!selectedDate

  // Check if selectedDate is today and get current time for filtering
  const isToday = React.useMemo(() => {
    if (!hasSelectedDate || !selectedDate) return false
    const today = new Date()
    const selected = new Date(selectedDate)
    // Compare year, month, and day to avoid timezone issues
    return (
      today.getFullYear() === selected.getFullYear() &&
      today.getMonth() === selected.getMonth() &&
      today.getDate() === selected.getDate()
    )
  }, [hasSelectedDate, selectedDate])

  const getCurrentTime = () => {
    const now = new Date()
    return {
      currentHour: now.getHours(),
      currentMinute: now.getMinutes(),
    }
  }

  const isPastHour = (hour: number) => {
    if (!hasSelectedDate) return false
    if (!isToday) return false

    const { currentHour } = getCurrentTime()
    return hour < currentHour
  }

  const isPastMinute = (hour: number, minute: number) => {
    if (!hasSelectedDate) return false
    if (!isToday) return false

    const { currentHour, currentMinute } = getCurrentTime()
    if (hour < currentHour) return true
    if (hour > currentHour) return false
    return minute < currentMinute
  }

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      setSelectedHour(h)
      setSelectedMinute(m)
      setTime(value)
    }
  }, [value])

  const handleHourSelect = (hour: string) => {
    const hourNum = parseInt(hour)
    if (isPastHour(hourNum)) {
      return
    }
    setSelectedHour(hour)
    setMode("minute")
  }

  const handleMinuteSelect = (minute: string) => {
    const minuteNum = parseInt(minute)
    const hourNum = parseInt(selectedHour)
    if (isPastMinute(hourNum, minuteNum)) {
      return
    }
    setSelectedMinute(minute)
    const newTime = `${selectedHour}:${minute}`
    setTime(newTime)
    onChange?.(newTime)
    setOpen(false)
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return placeholder
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${m} ${ampm}`
  }

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (isOpen) setMode("hour")
    }}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !time && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-slate-500" />
          {time ? formatTime(time) : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 bg-background">
          <div className="flex items-center justify-center gap-1 mb-3 pb-2 border-b">
            <button
              type="button"
              onClick={() => setMode("hour")}
              className={cn(
                "text-xl font-medium px-2 py-0.5 rounded min-w-[40px] text-center",
                mode === "hour" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              {selectedHour}
            </button>
            <span className="text-xl font-light text-muted-foreground">:</span>
            <button
              type="button"
              onClick={() => setMode("minute")}
              className={cn(
                "text-xl font-medium px-2 py-0.5 rounded min-w-[40px] text-center",
                mode === "minute" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              {selectedMinute}
            </button>
          </div>

          {mode === "hour" ? (
            <div className="grid grid-cols-6 gap-1 w-fit">
              {hours.map((hour) => {
                const hourNum = parseInt(hour)
                const disabledHour = isPastHour(hourNum)
                return (
                  <Button
                    key={hour}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabledHour}
                    className={cn(
                      "h-8 w-8 p-0 font-normal text-xs rounded",
                      selectedHour === hour
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : disabledHour
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleHourSelect(hour)}
                  >
                    {hour}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 w-fit">
              {minutes.map((minute) => {
                const minuteNum = parseInt(minute)
                const hourNum = parseInt(selectedHour)
                const disabledMinute = isPastMinute(hourNum, minuteNum)
                return (
                  <Button
                    key={minute}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabledMinute}
                    className={cn(
                      "h-9 w-12 p-0 font-normal text-xs rounded",
                      selectedMinute === minute
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : disabledMinute
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleMinuteSelect(minute)}
                  >
                    {minute}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
