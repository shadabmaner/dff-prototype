"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export type SalesLoaderVariant = "page" | "section" | "inline"

interface SalesLoaderProps {
  title?: string
  message?: string
  variant?: SalesLoaderVariant
  className?: string
}

const wrapperClasses: Record<SalesLoaderVariant, string> = {
  page: "flex min-h-[320px] w-full items-center justify-center",
  section: "w-full",
  inline: "w-full",
}

const containerClasses: Record<SalesLoaderVariant, string> = {
  page: "max-w-xl rounded-[32px] border border-white/70 bg-white/90 px-10 py-12 text-center shadow-[0_45px_120px_rgba(15,23,42,0.18)] backdrop-blur",
  section: "rounded-[28px] border border-slate-100 bg-white/95 px-8 py-10 text-center shadow-[0_25px_60px_rgba(15,23,42,0.12)]",
  inline: "rounded-2xl border border-slate-100 bg-white/95 px-6 py-6 text-center shadow-[0_15px_35px_rgba(15,23,42,0.12)]",
}

export function SalesLoader({
  title = "Refreshing your workspace",
  message = "Give us a moment while we sync the latest sales intelligence.",
  variant = "section",
  className,
}: SalesLoaderProps) {
  return (
    <div className={cn(wrapperClasses[variant], className)}>
      <div className={cn("relative overflow-hidden", containerClasses[variant])}>
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-24 left-20 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-purple-200/40 blur-3xl" />
        </div>
        <div className="relative space-y-4">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-3xl bg-gradient-to-br from-blue-400/40 to-indigo-400/40" />
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-500">Syncing</p>
            <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  "mx-auto h-3 w-4/5 rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100",
                  index === 0 && "w-3/4",
                  index === 2 && "w-2/3"
                )}
              >
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-200/60 to-transparent animate-[shimmer_1.8s_infinite]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Keyframe utility via Tailwind's arbitrary value
// shimmer animation defined inline above
