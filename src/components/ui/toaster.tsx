"use client"

import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[360px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-md border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-950",
            t.variant === "destructive" &&
              "border-red-600/40 bg-red-50 dark:bg-red-950/30"
          )}
          role="status"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {t.title && <div className="font-medium">{t.title}</div>}
              {t.description && (
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {t.description}
                </div>
              )}
            </div>
            <button
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              onClick={() => dismiss(t.id)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
