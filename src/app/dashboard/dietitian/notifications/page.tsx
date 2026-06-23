"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BellRing, Check, Search, TriangleAlert, Info, AlertTriangle, CheckCheck, Sparkles } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { dietitianNotifications } from "../data"
import { cn } from "@/lib/utils"

const severityMeta: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string; dot: string }> = {
  info: {
    icon: <Info className="h-4 w-4" />,
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-500",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },
  critical: {
    icon: <TriangleAlert className="h-4 w-4" />,
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-100",
    dot: "bg-rose-500",
  },
}

export default function NotificationsCenterPage() {
  const [search, setSearch] = useState("")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)

  const filteredNotifications = useMemo(() => {
    return dietitianNotifications.filter((n) => {
      if (showUnreadOnly && n.read) return false
      if (severityFilter && n.severity !== severityFilter) return false
      if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, showUnreadOnly, severityFilter])

  const counts = useMemo(() => ({
    critical: dietitianNotifications.filter((n) => n.severity === "critical").length,
    warning: dietitianNotifications.filter((n) => n.severity === "warning").length,
    info: dietitianNotifications.filter((n) => n.severity === "info").length,
    unread: dietitianNotifications.filter((n) => !n.read).length,
  }), [])

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-8 py-9 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-16 h-36 w-36 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-blue-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">Notification Centre</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">Alerts &amp; Escalations</h1>
              <p className="mt-2 text-sm text-slate-300">System-generated nudges for assignments, plans, compliance, and reviews.</p>
            </div>
            <div className="flex items-center gap-2">
              {counts.unread > 0 && (
                <Badge className="rounded-full border-white/10 bg-blue-500/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-300">
                  {counts.unread} unread
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Severity counts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {(["critical", "warning", "info"] as const).map((level) => {
          const meta = severityMeta[level]
          return (
            <button
              key={level}
              onClick={() => setSeverityFilter(severityFilter === level ? null : level)}
              className={cn(
                "group rounded-2xl border p-4 text-left transition-all hover:shadow-md",
                severityFilter === level
                  ? cn(meta.bg, meta.border, "shadow-md ring-2 ring-offset-1", level === "critical" ? "ring-rose-300" : level === "warning" ? "ring-amber-300" : "ring-blue-300")
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <div className={cn("mb-2 flex h-10 w-10 items-center justify-center rounded-xl", meta.bg, meta.text)}>
                {meta.icon}
              </div>
              <p className={cn("text-2xl font-black", severityFilter === level ? meta.text : "text-slate-900")}>
                {counts[level]}
              </p>
              <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 capitalize">{level}</p>
            </button>
          )
        })}
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-none shadow-md">
          <CardContent className="flex flex-wrap items-center gap-4 py-4 px-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <Input
                placeholder="Search notifications…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-xl border-slate-200 pl-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Unread only</span>
              <Switch checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
            </div>
            {severityFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-slate-500 hover:text-slate-900"
                onClick={() => setSeverityFilter(null)}
              >
                Clear filter ×
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map((notification, index) => {
            const meta = severityMeta[notification.severity]
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className={cn(
                  "border-l-4 shadow-sm transition hover:shadow-md",
                  meta.border,
                  notification.severity === "critical" ? "border-l-rose-500" : notification.severity === "warning" ? "border-l-amber-500" : "border-l-blue-500"
                )}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.bg, meta.text)}>
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500">{notification.description}</p>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("border-none font-semibold capitalize", meta.bg, meta.text)}>
                        {notification.severity}
                      </Badge>
                      {!notification.read && (
                        <Badge className="border-none bg-blue-100 text-blue-700 font-semibold">New</Badge>
                      )}
                      <Button size="sm" variant="outline" className="rounded-xl gap-1.5 hover:border-emerald-500 hover:text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                        Acknowledge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border border-dashed border-slate-200">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-slate-400">
                <Sparkles className="h-10 w-10 text-slate-200" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em]">No notifications match your filters</p>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setSearch(""); setSeverityFilter(null); setShowUnreadOnly(false) }}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
