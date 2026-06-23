"use client"

import type { ReactNode } from "react"
import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  Clock,
  Globe,
  Loader2,
  Package,
  Plus,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { useSuperAdmin } from "@/components/super-admin/super-admin-context"
import { LANGUAGE_OPTIONS } from "@/components/super-admin/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PLACEHOLDER_LANGUAGES = [
  { key: "placeholder-en", label: "English (Pilot)", plansCount: 3, staffCount: 8, live: false },
  { key: "placeholder-hi", label: "Hindi (Discovery)", plansCount: 2, staffCount: 5, live: false },
  { key: "placeholder-ta", label: "Tamil (Intake)", plansCount: 1, staffCount: 3, live: false },
]

export default function SpecialityLanguageHub() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const {
    specialties: { data, loading },
    updateSpecialty,
  } = useSuperAdmin()

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading speciality blueprint…
        </div>
      </div>
    )
  }

  function MissingSpecialityState({ backHref, title, description }: { backHref: string; title: string; description: string }) {
    return (
      <div className="space-y-6">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
        <Card className="border border-dashed border-border/60">
          <CardHeader className="flex flex-col items-center text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
            <p>Try refreshing the catalogue or confirm that the speciality ID exists.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href={backHref}>Return to list</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const specialtyId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined
  const specialty = data.find((item) => item.id === specialtyId)
  if (!specialty) {
    return (
      <MissingSpecialityState
        backHref="/dashboard/super-admin/specialities"
        title="Speciality unavailable"
        description="We couldn't locate this speciality in the current mock dataset. It may have been archived or the ID is incorrect."
      />
    )
  }

  const languages = [...specialty.languages].sort()
  const [languageDraft, setLanguageDraft] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const languageCards = React.useMemo(() => {
    if (languages.length) {
      return languages.map((language) => ({
        key: language,
        label: language,
        plansCount: specialty.plans.filter((plan) => plan.language === language).length,
        staffCount: specialty.staff.filter((member) => member.availability !== "OOO").length,
        live: true,
      }))
    }
    return PLACEHOLDER_LANGUAGES
  }, [languages, specialty.plans, specialty.staff])
  const hasLiveLanguages = languages.length > 0

  const handleAddLanguage = async () => {
    if (!languageDraft) return
    if (languages.includes(languageDraft)) {
      toast.info(`${languageDraft} already exists`)
      return
    }
    try {
      setBusy(true)
      await updateSpecialty(specialty.id, { languages: [...languages, languageDraft].sort() })
      toast.success(`Added ${languageDraft}`)
      setLanguageDraft(null)
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to add language")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 md:p-10 shadow-2xl border border-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-primary/20 blur-[130px]" />
          <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2 rounded-xl border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em] px-4 h-9">
              <Link href="/dashboard/super-admin/specialities">
                <ArrowLeft className="h-3 w-3" /> Back to catalogue
              </Link>
            </Button>
            <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner">
              HUB-{specialty.id.slice(0, 8)}
            </Badge>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-0.5 rounded-full bg-primary" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Hub</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {specialty.name} <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-300 bg-clip-text text-transparent">Blueprint</span>
            </h1>
            <p className="max-w-2xl text-sm text-slate-400 font-medium leading-relaxed">
              Global orchestration for clinical localisations and multi-market delivery vectors.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
        <StatCard label="Programs" value={specialty.programs_count.toString()} icon={<Package className="h-6 w-6" />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Clinicians" value={specialty.cliniciansCount.toString()} icon={<Users className="h-6 w-6" />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Current Status" value={specialty.status} icon={<Activity className="h-6 w-6" />} color="text-emerald-600" bg="bg-emerald-50" badge />
        <StatCard label="Sync Vector" value="Active Hub" valueOverride={new Date(specialty.lastUpdated).toLocaleDateString()} icon={<Globe className="h-6 w-6" />} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <Card className="fresh-card-alt border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-slate-100/50 p-10">
          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Expand Localisation</CardTitle>
          </div>
          <CardDescription className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400">Initialize a new language lane for this speciality</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-10 md:flex-row md:items-center">
          <div className="relative w-full md:w-80">
            <Select value={languageDraft ?? ""} onValueChange={(value) => setLanguageDraft(value)}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-primary/20">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 p-2">
                {LANGUAGE_OPTIONS.map((language) => (
                  <SelectItem key={language.value} value={language.value} disabled={languages.includes(language.value)} className="rounded-xl py-2.5">
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddLanguage} disabled={!languageDraft || busy} className="h-12 px-8 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:scale-100">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Provision Lane
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {languageCards.map((language) => (
          <Card key={language.key ?? language.label} className="group fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{language.label}</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Market Segment</CardDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                <Globe className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-500" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border-none px-4 py-1 shadow-sm">
                  {language.plansCount} active plans
                </Badge>
                <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 border-slate-100 px-4 py-1">
                  {language.staffCount} provisioned staff
                </Badge>
              </div>
              {language.live ? (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl justify-between border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-6"
                  onClick={() => router.push(`/dashboard/super-admin/specialities/${specialty.id}/details?language=${encodeURIComponent(language.label)}`)}
                >
                  Configure Blueprint
                  <ArrowLeft className="rotate-180 h-4 w-4 text-primary" />
                </Button>
              ) : (
                <Button variant="secondary" className="w-full h-12 rounded-2xl justify-between bg-slate-50 text-slate-400 border-none text-[10px] font-black uppercase tracking-[0.2em]" disabled>
                  Lane Discovery
                  <Clock className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {
        !hasLiveLanguages && (
          <p className="text-sm text-muted-foreground">
            Showing sample lanes so you can preview the blueprint experience. Add a language above to swap in real data.
          </p>
        )
      }
    </div >
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  valueOverride,
  badge,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  bg: string
  valueOverride?: string
  badge?: boolean
}) {
  return (
    <Card className="group fresh-card-alt border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
      <CardContent className="flex items-center gap-5 p-8">
        <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", bg)}>
          <div className={cn(color)}>{icon}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          {badge ? (
            <Badge className={cn("rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm", value === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600")}>{value}</Badge>
          ) : (
            <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{valueOverride ?? value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
