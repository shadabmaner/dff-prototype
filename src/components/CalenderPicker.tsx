"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  value?: Date
  onChange?: (date?: Date) => void
  placeholder?: string
  className?: string
  disabled?: (date: Date) => boolean
  defaultOpen?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  defaultOpen = false,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [open, setOpen] = React.useState(defaultOpen)
  const handleSelect = (selectedDate?: Date) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
    // Auto-collapse after selection
    if (selectedDate) {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />

          {date ? format(date, "dd MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
          
        />
      </PopoverContent>
    </Popover>
  )
}