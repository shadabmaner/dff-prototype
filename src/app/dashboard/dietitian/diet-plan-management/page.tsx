"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Salad,
  ClipboardList,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  X,
  ChefHat,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { dietPlans, dietitianPatients } from "../data"
import { cn } from "@/lib/utils"

const mealSlots = ["Breakfast", "Mid-morning", "Lunch", "Evening Snack", "Dinner"] as const

const mealSlotColor: Record<string, string> = {
  Breakfast: "bg-amber-50 border-amber-200 text-amber-700",
  "Mid-morning": "bg-orange-50 border-orange-200 text-orange-700",
  Lunch: "bg-emerald-50 border-emerald-200 text-emerald-700",
  "Evening Snack": "bg-blue-50 border-blue-200 text-blue-700",
  Dinner: "bg-violet-50 border-violet-200 text-violet-700",
}

type DraftMeal = {
  slot: (typeof mealSlots)[number]
  items: string
  portion: string
  alternatives: string
  notes: string
}

export default function DietPlanManagementPage() {
  const patientOptions = useMemo(
    () => dietitianPatients.map((p) => ({ id: p.id, label: `${p.name} (${p.programName})` })),
    []
  )

  const [selectedPatient, setSelectedPatient] = useState(patientOptions[0]?.id ?? "")
  const [title, setTitle] = useState("Personalized Blueprint")
  const [calories, setCalories] = useState(1500)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("Focus on steady glucose, hydrate 3L, wound-healing nutrients")
  const [restrictions, setRestrictions] = useState("Refined sugar, deep fried foods")
  const [attachments, setAttachments] = useState<File[]>([])
  const [meals, setMeals] = useState<DraftMeal[]>(
    mealSlots.map((slot) => ({ slot, items: "", portion: "", alternatives: "", notes: "" }))
  )
  const [savedPlans, setSavedPlans] = useState<typeof dietPlans>([])
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd")
    const nextWeek = format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd")
    setStartDate(today)
    setEndDate(nextWeek)
  }, [])

  const patientPlans = useMemo(
    () => dietPlans.filter((plan) => plan.patientId === selectedPatient).concat(savedPlans),
    [selectedPatient, savedPlans]
  )

  const updateMeal = (index: number, key: keyof DraftMeal, value: string) => {
    setMeals((prev) => prev.map((meal, idx) => (idx === index ? { ...meal, [key]: value } : meal)))
  }

  const handleAddAttachment = (files: FileList | null) => {
    if (!files) return
    setAttachments(Array.from(files))
  }

  const handleSubmit = () => {
    if (!selectedPatient) { setStatus("⚠️ Pick a patient first"); return }
    if (!title.trim()) { setStatus("⚠️ Plan title cannot be empty"); return }
    if (Number.isNaN(calories) || calories <= 0) { setStatus("⚠️ Calorie target must be numeric"); return }
    if (endDate < startDate) { setStatus("⚠️ End date must be after start date"); return }

    const payload = {
      id: `PLAN-${Math.floor(Math.random() * 900 + 100)}`,
      patientId: selectedPatient,
      title,
      startDate,
      endDate,
      dailyCalories: calories,
      notes,
      restrictions: restrictions.split(",").map((s) => s.trim()).filter(Boolean),
      meals: meals
        .filter((meal) => meal.items.trim())
        .map((meal) => ({
          slot: meal.slot,
          items: meal.items.split(",").map((i) => i.trim()).filter(Boolean),
          portion: meal.portion,
          alternatives: meal.alternatives ? meal.alternatives.split(",").map((i) => i.trim()) : [],
          notes: meal.notes,
        })),
      attachments: attachments.map((f) => f.name),
    }

    setSavedPlans((prev) => [payload, ...prev])
    setStatus("✅ Plan saved & patient notified. Compliance cycle recalculated!")
    setTimeout(() => setStatus(null), 4000)
  }

  const filledMeals = meals.filter((m) => m.items.trim()).length

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 px-8 py-9 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-20 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400">Diet Plan Studio</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">Create &amp; Manage Blueprints</h1>
              <p className="mt-2 text-sm text-emerald-200">
                Calorie rules enforced · Notifications sent automatically ·{" "}
                <span className="font-bold text-white">{filledMeals} slots filled</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => window.location.reload()}
              >
                Reset Form
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 gap-1.5 font-bold"
                onClick={handleSubmit}
              >
                <Sparkles className="h-4 w-4" />
                Save &amp; Notify
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Plan Parameters */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
                Plan Parameters
              </CardTitle>
              <CardDescription>Every change updates the digital handout instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Select Patient"
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                  options={patientOptions}
                  placeholder="Pick a patient"
                />
                <FormField label="Plan Title">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Metabolic Reset Phase 2"
                    className="h-11 rounded-xl"
                  />
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Daily Calories (kcal)">
                  <Input
                    type="number"
                    min={1000}
                    max={4000}
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="h-11 rounded-xl"
                  />
                </FormField>
                <FormField label="Start Date">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl" />
                </FormField>
                <FormField label="End Date">
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-xl" />
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Restrictions">
                  <Textarea
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="Sugar, fried..."
                    className="min-h-[90px] rounded-xl resize-none"
                  />
                </FormField>
                <FormField label="Notes">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add context for patient alerts"
                    className="min-h-[90px] rounded-xl resize-none"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Meal Builder */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Salad className="h-5 w-5 text-emerald-600" />
                Meal Builder
              </CardTitle>
              <CardDescription>Fill in meal slots · {filledMeals} of {meals.length} filled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meals.map((meal, index) => (
                <div
                  key={meal.slot + index}
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    meal.items.trim()
                      ? mealSlotColor[meal.slot] || "bg-slate-50 border-slate-200"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className={cn("border font-bold", mealSlotColor[meal.slot] || "bg-slate-100 border-slate-200 text-slate-600")}>
                      {meal.slot}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-rose-50 hover:text-rose-500"
                      onClick={() => {
                        updateMeal(index, "items", "")
                        updateMeal(index, "portion", "")
                        updateMeal(index, "alternatives", "")
                        updateMeal(index, "notes", "")
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <MealInput label="Items" value={meal.items} onChange={(v) => updateMeal(index, "items", v)} placeholder="Oats, boiled eggs, berry mix" />
                    <MealInput label="Portion" value={meal.portion} onChange={(v) => updateMeal(index, "portion", v)} placeholder="320 kcal / 20g protein" />
                    <MealInput label="Alternatives" value={meal.alternatives} onChange={(v) => updateMeal(index, "alternatives", v)} placeholder="Millet porridge, almond smoothie" />
                    <MealInput label="Notes" value={meal.notes} onChange={(v) => updateMeal(index, "notes", v)} placeholder="Prefer warm foods" />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full rounded-xl gap-1.5 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400"
                onClick={() => setMeals((prev) => [...prev, { slot: "Evening Snack", items: "", portion: "", alternatives: "", notes: "" }])}
              >
                <Plus className="h-4 w-4" />
                Add Custom Slot
              </Button>
            </CardContent>
          </Card>

          {/* Attachment */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-slate-500" />
                Attach Recipes
              </CardTitle>
              <CardDescription>Upload PDF meal plans or recipe cards</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/30">
                <UploadCloud className="h-8 w-8 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-600">Drop files or click to browse</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, images up to 10MB</p>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                    {attachments.map((f) => (
                      <Badge key={f.name} variant="secondary" className="text-xs">{f.name}</Badge>
                    ))}
                  </div>
                )}
                <input type="file" multiple className="hidden" onChange={(e) => handleAddAttachment(e.target.files)} />
              </label>
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
                {status.startsWith("✅") ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <Sparkles className="h-5 w-5 shrink-0" />}
                {status.replace("✅ ", "").replace("⚠️ ", "")}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Existing Plans Sidebar */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="sticky top-6 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-slate-500" />
                Existing Plans
              </CardTitle>
              <CardDescription>Auto-archived when a new plan is activated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patientPlans.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
                  <ClipboardList className="h-8 w-8 text-slate-200" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">No plans yet</p>
                </div>
              ) : (
                patientPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 leading-tight">{plan.title}</p>
                      <Badge variant="secondary" className="shrink-0 rounded-lg text-[10px] font-semibold">
                        {plan.dailyCalories} kcal
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{plan.startDate} → {plan.endDate}</p>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{plan.notes}</p>
                    {plan.restrictions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.restrictions.slice(0, 2).map((r) => (
                          <Badge key={r} variant="outline" className="text-[10px] text-rose-500 border-rose-100 bg-rose-50">{r}</Badge>
                        ))}
                        {plan.restrictions.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{plan.restrictions.length - 2} more</span>
                        )}
                      </div>
                    )}
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

function SelectField({ label, value, onValueChange, options, placeholder }: {
  label: string; value: string; onValueChange: (v: string) => void; options: { id: string; label: string }[]; placeholder: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 rounded-xl border-slate-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      {children}
    </div>
  )
}

function MealInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-lg border-slate-200 bg-white/70 text-sm"
      />
    </div>
  )
}
