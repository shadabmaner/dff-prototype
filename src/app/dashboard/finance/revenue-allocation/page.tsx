"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  PieChart,
  Building2,
  SlidersHorizontal,
  IndianRupee,
  AlertTriangle,
  X,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type AllocationBasis = "percentage" | "fixed" | "per-patient"

interface AllocationRule {
  id: string
  department: string
  program: string
  basis: AllocationBasis
  value: number
  notes: string
  color: string
}

interface SavedAllocation {
  id: string
  title: string
  totalRevenue: number
  period: string
  createdAt: string
  rules: AllocationRule[]
  notes: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Dietitian Services",
  "Clinical Nutrition",
  "Wellness Programs",
  "Administration",
  "Marketing",
  "Research & Development",
  "Operations",
  "IT & Infrastructure",
]

const PROGRAMS = [
  "Diabetes Management",
  "Weight Loss",
  "PCOS Nutrition",
  "Thyroid Care",
  "Post-Surgery Recovery",
  "General Wellness",
  "Corporate Health",
  "Paediatric Nutrition",
]

const RULE_COLORS = [
  { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", bar: "bg-blue-500" },
  { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500" },
  { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", bar: "bg-violet-500" },
  { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", bar: "bg-amber-500" },
  { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", bar: "bg-rose-500" },
  { bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700", bar: "bg-cyan-500" },
  { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", bar: "bg-orange-500" },
  { bg: "bg-pink-50 border-pink-200", text: "text-pink-700", bar: "bg-pink-500" },
]

const MOCK_SAVED: SavedAllocation[] = [
  {
    id: "alloc_001",
    title: "Q1 2025 Allocation",
    totalRevenue: 850000,
    period: "Jan – Mar 2025",
    createdAt: "2025-01-05",
    notes: "Increased R&D share for new programme rollout.",
    rules: [
      { id: "r1", department: "Dietitian Services", program: "Diabetes Management", basis: "percentage", value: 35, notes: "", color: "blue" },
      { id: "r2", department: "Administration", program: "General Wellness", basis: "percentage", value: 20, notes: "", color: "emerald" },
      { id: "r3", department: "Marketing", program: "Weight Loss", basis: "percentage", value: 15, notes: "", color: "violet" },
    ],
  },
  {
    id: "alloc_002",
    title: "Feb Dietitian Bonus Pool",
    totalRevenue: 120000,
    period: "Feb 2025",
    createdAt: "2025-02-01",
    notes: "Bonus distribution for high-adherence dietitians.",
    rules: [
      { id: "r4", department: "Dietitian Services", program: "PCOS Nutrition", basis: "per-patient", value: 500, notes: "", color: "amber" },
    ],
  },
]

const defaultRule = (): AllocationRule => ({
  id: `rule_${Math.random().toString(36).slice(2, 8)}`,
  department: DEPARTMENTS[0],
  program: PROGRAMS[0],
  basis: "percentage",
  value: 0,
  notes: "",
  color: "blue",
})

const formatAmount = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RevenueAllocationPage() {
  const [title, setTitle] = useState("Q2 2025 Allocation")
  const [totalRevenue, setTotalRevenue] = useState(1000000)
  const [period, setPeriod] = useState("")
  const [notes, setNotes] = useState("")
  const [rules, setRules] = useState<AllocationRule[]>([
    { ...defaultRule(), department: "Dietitian Services", program: "Diabetes Management", value: 35, color: "0" },
    { ...defaultRule(), department: "Administration", program: "General Wellness", value: 20, color: "1" },
    { ...defaultRule(), department: "Marketing", program: "Weight Loss", value: 15, color: "2" },
  ])
  const [savedAllocations, setSavedAllocations] = useState<SavedAllocation[]>(MOCK_SAVED)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    const month = now.toLocaleString("en-IN", { month: "long" })
    setPeriod(`${month} ${now.getFullYear()}`)
  }, [])

  // ── Derived ──
  const totalPct = useMemo(
    () => rules.filter((r) => r.basis === "percentage").reduce((s, r) => s + Number(r.value), 0),
    [rules]
  )

  const totalFixed = useMemo(
    () => rules.filter((r) => r.basis === "fixed").reduce((s, r) => s + Number(r.value), 0),
    [rules]
  )

  const allocatedAmount = useMemo(() => {
    const fromPct = (totalPct / 100) * totalRevenue
    return fromPct + totalFixed
  }, [totalPct, totalRevenue, totalFixed])

  const unallocated = totalRevenue - allocatedAmount
  const overAllocated = allocatedAmount > totalRevenue

  const addRule = () => {
    const colorIdx = rules.length % RULE_COLORS.length
    setRules((prev) => [...prev, { ...defaultRule(), color: String(colorIdx) }])
  }

  const removeRule = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id))

  const updateRule = (id: string, key: keyof AllocationRule, value: string | number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  }

  const handleSave = () => {
    if (!title.trim()) { setStatus("⚠️ Allocation title cannot be empty"); return }
    if (totalRevenue <= 0) { setStatus("⚠️ Total revenue must be greater than zero"); return }
    if (rules.length === 0) { setStatus("⚠️ Add at least one allocation rule"); return }
    if (overAllocated) { setStatus("⚠️ Allocated amount exceeds total revenue"); return }

    const payload: SavedAllocation = {
      id: `alloc_${Math.random().toString(36).slice(2, 8)}`,
      title,
      totalRevenue,
      period,
      createdAt: new Date().toISOString().split("T")[0],
      notes,
      rules,
    }

    setSavedAllocations((prev) => [payload, ...prev])
    setStatus("✅ Allocation saved and departments notified!")
    setTimeout(() => setStatus(null), 4000)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ── Hero Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-8 py-9 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-20 h-40 w-40 rounded-full bg-indigo-300/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">Finance / Revenue Allocation</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">Revenue Allocation Studio</h1>
              <p className="mt-2 text-sm text-blue-200">
                Define distribution rules · Auto-calculate splits ·{" "}
                <span className="font-bold text-white">{rules.length} rule{rules.length !== 1 ? "s" : ""} active</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => {
                  setRules([])
                  setTitle("Q2 2025 Allocation")
                  setNotes("")
                }}
              >
                Reset Form
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-white text-slate-900 hover:bg-blue-50 gap-1.5 font-bold"
                onClick={handleSave}
              >
                <Sparkles className="h-4 w-4" />
                Save &amp; Notify
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Parameters */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                Allocation Parameters
              </CardTitle>
              <CardDescription>Set the revenue pool and period before defining rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Allocation Title">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Q2 2025 Allocation"
                    className="h-11 rounded-xl"
                  />
                </FormField>
                <FormField label="Period">
                  <Input
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="Apr – Jun 2025"
                    className="h-11 rounded-xl"
                  />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Total Revenue (₹)">
                  <Input
                    type="number"
                    min={0}
                    value={totalRevenue}
                    onChange={(e) => setTotalRevenue(Number(e.target.value))}
                    className="h-11 rounded-xl"
                  />
                </FormField>
                <FormField label="Notes">
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Context for this allocation cycle"
                    className="h-11 rounded-xl"
                  />
                </FormField>
              </div>

              {/* Summary bar */}
              <div className={cn(
                "rounded-2xl border px-5 py-4 space-y-3",
                overAllocated ? "border-rose-200 bg-rose-50" : "border-blue-100 bg-blue-50/60"
              )}>
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-bold uppercase tracking-widest", overAllocated ? "text-rose-600" : "text-blue-700")}>
                    {overAllocated ? "⚠ Over-allocated" : "Allocation Summary"}
                  </span>
                  <span className={cn("text-sm font-black", overAllocated ? "text-rose-700" : "text-slate-900")}>
                    {formatAmount(allocatedAmount)} / {formatAmount(totalRevenue)}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", overAllocated ? "bg-rose-500" : "bg-blue-500")}
                    style={{ width: `${Math.min((allocatedAmount / totalRevenue) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={overAllocated ? "text-rose-600" : "text-blue-600"}>
                    {Math.min((allocatedAmount / totalRevenue) * 100, 100).toFixed(1)}% allocated
                  </span>
                  <span className={overAllocated ? "text-rose-500" : "text-slate-500"}>
                    {overAllocated ? `${formatAmount(Math.abs(unallocated))} over budget` : `${formatAmount(unallocated)} unallocated`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rule Builder */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Allocation Rules
              </CardTitle>
              <CardDescription>Define how revenue is split across departments and programs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
                  <Building2 className="h-8 w-8 text-slate-200" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">No rules yet</p>
                </div>
              )}

              {rules.map((rule, idx) => {
                const colorIdx = Number(rule.color) % RULE_COLORS.length || idx % RULE_COLORS.length
                const colors = RULE_COLORS[colorIdx]
                const ruleAmount =
                  rule.basis === "percentage"
                    ? (Number(rule.value) / 100) * totalRevenue
                    : Number(rule.value)

                return (
                  <div
                    key={rule.id}
                    className={cn("rounded-2xl border p-4 transition", colors.bg)}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("border font-bold text-xs", colors.bg, colors.text)}>
                          Rule {idx + 1}
                        </Badge>
                        {ruleAmount > 0 && (
                          <span className={cn("text-xs font-bold", colors.text)}>
                            ≈ {formatAmount(ruleAmount)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:bg-rose-50 hover:text-rose-500"
                        onClick={() => removeRule(rule.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <RuleSelect
                        label="Department"
                        value={rule.department}
                        options={DEPARTMENTS}
                        onChange={(v) => updateRule(rule.id, "department", v)}
                      />
                      <RuleSelect
                        label="Program"
                        value={rule.program}
                        options={PROGRAMS}
                        onChange={(v) => updateRule(rule.id, "program", v)}
                      />
                      <RuleSelect
                        label="Basis"
                        value={rule.basis}
                        options={["percentage", "fixed", "per-patient"]}
                        onChange={(v) => updateRule(rule.id, "basis", v as AllocationBasis)}
                        formatLabel={(v) => v === "percentage" ? "% of Revenue" : v === "fixed" ? "Fixed Amount (₹)" : "Per Patient (₹)"}
                      />
                      <RuleInput
                        label={rule.basis === "percentage" ? "Percentage (%)" : "Amount (₹)"}
                        value={String(rule.value)}
                        onChange={(v) => updateRule(rule.id, "value", v)}
                        placeholder={rule.basis === "percentage" ? "e.g. 25" : "e.g. 50000"}
                        type="number"
                      />
                    </div>

                    {/* Progress within rule */}
                    {rule.basis === "percentage" && Number(rule.value) > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", colors.bar)}
                            style={{ width: `${Math.min(Number(rule.value), 100)}%` }}
                          />
                        </div>
                        <span className={cn("text-[11px] font-bold", colors.text)}>{rule.value}%</span>
                      </div>
                    )}

                    <div className="mt-3">
                      <RuleInput
                        label="Notes"
                        value={rule.notes}
                        onChange={(v) => updateRule(rule.id, "notes", v)}
                        placeholder="Optional context for this rule"
                      />
                    </div>
                  </div>
                )
              })}

              <Button
                variant="outline"
                className="w-full rounded-xl gap-1.5 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                onClick={addRule}
              >
                <Plus className="h-4 w-4" />
                Add Allocation Rule
              </Button>
            </CardContent>
          </Card>

          {/* Status Feedback */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold",
                  status.startsWith("✅")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                )}
              >
                {status.startsWith("✅")
                  ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                  : <AlertTriangle className="h-5 w-5 shrink-0" />}
                {status.replace("✅ ", "").replace("⚠️ ", "")}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right Sidebar: Saved Allocations ── */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="sticky top-6 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-500" />
                Saved Allocations
              </CardTitle>
              <CardDescription>Previously defined allocation cycles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedAllocations.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
                  <PieChart className="h-8 w-8 text-slate-200" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">No allocations yet</p>
                </div>
              ) : (
                savedAllocations.map((alloc) => (
                  <div key={alloc.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 leading-tight">{alloc.title}</p>
                      <Badge variant="secondary" className="shrink-0 rounded-lg text-[10px] font-semibold">
                        {alloc.period}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Created {alloc.createdAt}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <IndianRupee className="h-3 w-3 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{formatAmount(alloc.totalRevenue)}</span>
                      <span className="text-xs text-slate-400">total pool</span>
                    </div>
                    {alloc.notes && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{alloc.notes}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {alloc.rules.slice(0, 3).map((r) => (
                        <Badge key={r.id} variant="outline" className="text-[10px] text-blue-600 border-blue-100 bg-blue-50">
                          {r.department.split(" ")[0]}
                          {r.basis === "percentage" ? ` ${r.value}%` : ` ₹${r.value}`}
                        </Badge>
                      ))}
                      {alloc.rules.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{alloc.rules.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      {children}
    </div>
  )
}

function RuleInput({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-lg border-slate-200 bg-white/70 text-sm"
      />
    </div>
  )
}

function RuleSelect({
  label, value, options, onChange, formatLabel,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; formatLabel?: (v: string) => string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 rounded-lg border-slate-200 bg-white/70 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{formatLabel ? formatLabel(o) : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}