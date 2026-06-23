"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  Search,
  ListChecks,
  AlertCircle,
  Calendar,
  ChevronRight,
  Save,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { followUpReviews } from "../data"
import { cn } from "@/lib/utils"

const statusOptions = ["Due", "Completed", "Overdue"] as const
const CLEAR_STATUS_VALUE = "__ALL__"

const statusMeta: Record<string, { bg: string; text: string; icon: React.ReactNode; dot: string }> = {
  Overdue: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    dot: "bg-rose-500",
  },
  Due: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: <Clock className="h-3.5 w-3.5" />,
    dot: "bg-amber-500",
  },
  Completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    dot: "bg-emerald-500",
  },
}

export default function FollowUpReviewsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState(followUpReviews[0])
  const [notes, setNotes] = useState(selectedReview?.notes ?? "")
  const [nextReviewDate, setNextReviewDate] = useState(selectedReview?.nextReviewDate ?? "")
  const [status, setStatus] = useState(selectedReview?.status ?? "Due")
  const [toast, setToast] = useState<string | null>(null)

  const filteredReviews = useMemo(() => {
    return followUpReviews.filter((r) => {
      if (search && !r.patientName.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && r.status !== statusFilter) return false
      return true
    })
  }, [search, statusFilter])

  const handleSelectReview = (reviewId: string) => {
    const review = followUpReviews.find((r) => r.id === reviewId)
    if (!review) return
    setSelectedReview(review)
    setNotes(review.notes)
    setNextReviewDate(review.nextReviewDate ?? "")
    setStatus(review.status)
    setToast(null)
  }

  const handleSave = () => {
    if (!selectedReview) return
    setToast(`Review ${selectedReview.id} marked as ${status}. Next session: ${nextReviewDate || "pending"}.`)
  }

  const overdue = followUpReviews.filter((r) => r.status === "Overdue").length
  const due = followUpReviews.filter((r) => r.status === "Due").length
  const completed = followUpReviews.filter((r) => r.status === "Completed").length

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 px-8 py-9 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-24 h-40 w-40 rounded-full bg-violet-300/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-violet-300">Follow-up Ops</p>
              <h1 className="text-4xl font-black tracking-tight">Reviews &amp; Handoffs</h1>
              <p className="mt-2 text-sm text-violet-200">SLA monitors ensure due and overdue reviews bubble to the top.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="rounded-full border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-rose-300">
                {overdue} Overdue
              </Badge>
              <Badge className="rounded-full border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
                {due} Due
              </Badge>
              <Badge className="rounded-full border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                {completed} Done
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Layout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Review Queue */}
        <Card className="lg:col-span-2 border-none shadow-xl">
          <CardHeader className="border-b border-slate-100/70 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-500" />
                  Review Queue
                </CardTitle>
                <CardDescription className="mt-1">
                  <span className="font-semibold text-slate-700">{filteredReviews.length}</span> entries · Smart-sorted by urgency
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  placeholder="Search patient…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 pl-10 text-sm"
                />
              </div>
              <Select
                value={statusFilter ?? undefined}
                onValueChange={(v) => setStatusFilter(v === CLEAR_STATUS_VALUE || v === undefined ? null : v)}
              >
                <SelectTrigger className="h-10 w-[160px] rounded-xl border-slate-200 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_STATUS_VALUE}>All</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100/80">
              {filteredReviews.map((review) => {
                const isActive = selectedReview?.id === review.id
                const meta = statusMeta[review.status]
                return (
                  <li key={review.id}>
                    <button
                      onClick={() => handleSelectReview(review.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-all",
                        isActive
                          ? "bg-violet-50 border-l-4 border-violet-500"
                          : "hover:bg-slate-50/80 border-l-4 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", meta.bg, meta.text)}>
                          {meta.icon}
                        </div>
                        <div>
                          <p className={cn("text-sm font-bold leading-tight", isActive ? "text-violet-700" : "text-slate-900")}>
                            {review.patientName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {format(review.scheduledDate, "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("border-none font-semibold", meta.bg, meta.text)}>
                          {review.status}
                        </Badge>
                        <ChevronRight className={cn("h-4 w-4 text-slate-300 transition", isActive && "text-violet-500")} />
                      </div>
                    </button>
                  </li>
                )
              })}
              {filteredReviews.length === 0 && (
                <li className="py-16 text-center text-slate-400">
                  <ListChecks className="mx-auto mb-3 h-8 w-8 text-slate-200" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">No reviews match filters</p>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Review Details */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                <ListChecks className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <CardTitle>Review Details</CardTitle>
                <CardDescription>Update notes, outcomes &amp; next steps</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {!selectedReview ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-400">
                <ListChecks className="mx-auto mb-2 h-6 w-6 text-slate-200" />
                <p className="text-sm">Select a review to manage</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Patient Info */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-base font-black text-slate-900">{selectedReview.patientName}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Scheduled {format(selectedReview.scheduledDate, "PPP")}
                  </p>
                  <div className="mt-3">
                    <Badge className={cn(
                      "border-none font-bold",
                      statusMeta[selectedReview.status].bg,
                      statusMeta[selectedReview.status].text
                    )}>
                      {selectedReview.status}
                    </Badge>
                  </div>
                </div>

                {/* Status Select */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Update Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as (typeof statusOptions)[number])}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Session Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="rounded-xl resize-none"
                    placeholder="Add your review notes…"
                  />
                </div>

                {/* Next Review */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Next Review Date</label>
                  <Input
                    type="date"
                    value={nextReviewDate}
                    onChange={(e) => setNextReviewDate(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} className="w-full rounded-xl gap-2 bg-violet-600 hover:bg-violet-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>

                {/* Toast */}
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{toast}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
