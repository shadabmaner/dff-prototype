"use client"

import * as React from "react"
import { Calendar, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type DateFilterPreset = "today" | "yesterday" | "last_7_days" | "last_30_days" | "this_month" | "custom"

export interface DateRangeFilterValue {
  preset: DateFilterPreset
  label: string
  startDate?: string
  endDate?: string
}

interface DateRangeFilterProps {
  value?: DateRangeFilterValue
  onChange?: (val: DateRangeFilterValue) => void
  className?: string
}

const PRESETS: { id: DateFilterPreset; label: string; getDates: () => { start: string; end: string } }[] = [
  {
    id: "today",
    label: "Today",
    getDates: () => {
      const now = new Date()
      const d = now.toISOString().split("T")[0]
      return { start: d, end: d }
    },
  },
  {
    id: "yesterday",
    label: "Yesterday",
    getDates: () => {
      const y = new Date(Date.now() - 86400000)
      const d = y.toISOString().split("T")[0]
      return { start: d, end: d }
    },
  },
  {
    id: "last_7_days",
    label: "Last 7 Days",
    getDates: () => {
      const end = new Date().toISOString().split("T")[0]
      const start = new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0]
      return { start, end }
    },
  },
  {
    id: "last_30_days",
    label: "Last 30 Days",
    getDates: () => {
      const end = new Date().toISOString().split("T")[0]
      const start = new Date(Date.now() - 86400000 * 30).toISOString().split("T")[0]
      return { start, end }
    },
  },
  {
    id: "this_month",
    label: "This Month",
    getDates: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
      const end = new Date().toISOString().split("T")[0]
      return { start, end }
    },
  },
]

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [currentPreset, setCurrentPreset] = React.useState<DateFilterPreset>(value?.preset ?? "last_7_days")
  const [customStart, setCustomStart] = React.useState<string>(
    value?.startDate ?? new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0]
  )
  const [customEnd, setCustomEnd] = React.useState<string>(
    value?.endDate ?? new Date().toISOString().split("T")[0]
  )

  const activeLabel = React.useMemo(() => {
    if (currentPreset === "custom") {
      return `${customStart} to ${customEnd}`
    }
    const found = PRESETS.find((p) => p.id === currentPreset)
    return found?.label ?? "Last 7 Days"
  }, [currentPreset, customStart, customEnd])

  const handleSelectPreset = (preset: DateFilterPreset) => {
    setCurrentPreset(preset)
    if (preset !== "custom") {
      const found = PRESETS.find((p) => p.id === preset)
      if (found) {
        const dates = found.getDates()
        onChange?.({
          preset,
          label: found.label,
          startDate: dates.start,
          endDate: dates.end,
        })
        setOpen(false)
      }
    }
  }

  const handleApplyCustom = () => {
    setCurrentPreset("custom")
    onChange?.({
      preset: "custom",
      label: `${customStart} - ${customEnd}`,
      startDate: customStart,
      endDate: customEnd,
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900",
            className
          )}
        >
          <Calendar className="h-3.5 w-3.5 text-[#1F56A3]" />
          <span>{activeLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-2xl p-3 shadow-xl border-slate-200/80" align="end">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
            Date Range Filter
          </div>
          <div className="grid gap-1">
            {PRESETS.map((p) => {
              const isSelected = currentPreset === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left",
                    isSelected
                      ? "bg-blue-50 text-[#1F56A3] font-bold"
                      : "text-slate-700 hover:bg-slate-100/80"
                  )}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#1F56A3]" />}
                </button>
              )
            })}
          </div>

          <div className="border-t border-slate-100 pt-2.5 mt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Custom Range
            </div>
            <div className="grid grid-cols-2 gap-2 px-1">
              <div>
                <Label className="text-[10px] text-slate-500 font-medium">From</Label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-8 text-xs rounded-lg mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 font-medium">To</Label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-8 text-xs rounded-lg mt-1"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleApplyCustom}
              className="mt-3 w-full h-8 rounded-xl bg-[#1F56A3] text-white text-xs font-semibold hover:bg-[#192B42]"
            >
              Apply Custom Range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
