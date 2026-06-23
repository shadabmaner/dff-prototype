"use client"

import { useState } from 'react'
import { motion } from "framer-motion"
import {
  ClipboardList,
  Plus,
  History,
  CheckCircle2,
  RefreshCcw,
  ArrowUpRight,
  Search,
  Filter,
  Copy,
  FileText,
  ChevronRight,
  Target,
  Users,
  AlertCircle,
  Clock,
  LayoutGrid,
  Zap,
  TrendingUp,
  Edit,
  Eye,
  Loader2,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/shared/DataTable"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { useDietTemplates, useCreateDietTemplate } from "@/hooks/use-diet-template"
import type { Phase } from "@/types/diet-template"
import { StatCard } from '@/components/ui/stat-card'

export default function NutritionistDietPlans() {
  const router = useRouter()
  const { data: templates = [], isLoading, error } = useDietTemplates()
  const createTemplateMutation = useCreateDietTemplate()
  console.log(templates,"templates")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [planTitle, setPlanTitle] = useState("")
  const [planDescription, setPlanDescription] = useState("")
  const [planDuration, setPlanDuration] = useState("15")
  const [targetCaloriesMin, setTargetCaloriesMin] = useState("")
  const [targetCaloriesMax, setTargetCaloriesMax] = useState("")
  const [planNotes, setPlanNotes] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [phases, setPhases] = useState<Phase[]>([
    { phase_number: 1, phase_name: "Phase 1", start_day: 1, end_day: 7 }
  ])
  const [enablePhases, setEnablePhases] = useState(false)

  const handleCreatePlan = async () => {
    if (!planTitle || !planDuration) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const payload: any = {
        title: planTitle,
        description: planDescription || undefined,
        total_days: Number(planDuration),
        target_calories_min: targetCaloriesMin ? Number(targetCaloriesMin) : undefined,
        target_calories_max: targetCaloriesMax ? Number(targetCaloriesMax) : undefined,
        notes: planNotes || undefined,
      }

      if (enablePhases && phases.length > 0) {
        payload.phases = phases.map(p => ({
          phase_number: p.phase_number,
          phase_name: p.phase_name,
          start_day: Number(p.start_day),
          end_day: Number(p.end_day)
        }))
      }

      const newTemplate = await createTemplateMutation.mutateAsync(payload)
      toast.success("Diet template created successfully")
      setShowCreateDialog(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create diet template")
    }
  }

  const handleAddPhase = () => {
    const lastPhase = phases[phases.length - 1]
    const newStartDay = lastPhase ? lastPhase.end_day + 1 : 1
    const newEndDay = Math.min(newStartDay + 6, Number(planDuration))
    setPhases([...phases, {
      phase_number: phases.length + 1,
      phase_name: `Phase ${phases.length + 1}`,
      start_day: newStartDay,
      end_day: newEndDay
    }])
  }

  const handleRemovePhase = (index: number) => {
    const newPhases = phases.filter((_, i) => i !== index)
    // Re-number phases
    const renumberedPhases = newPhases.map((p, i) => ({
      ...p,
      phase_number: i + 1
    }))
    setPhases(renumberedPhases)
  }

  const handlePhaseChange = (index: number, field: keyof Phase, value: string | number) => {
    const newPhases = [...phases]
    newPhases[index] = { ...newPhases[index], [field]: value }
    setPhases(newPhases)
  }

  const resetForm = () => {
    setPlanTitle("")
    setPlanDescription("")
    setPlanDuration("15")
    setTargetCaloriesMin("")
    setTargetCaloriesMax("")
    setPlanNotes("")
    setPhases([{ phase_number: 1, phase_name: "Phase 1", start_day: 1, end_day: 7 }])
    setEnablePhases(false)
  }

  const filteredTemplates = templates?.data?.filter((template:any) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeTemplates = templates?.data?.filter((t:any) => t.is_active)
  const inactiveTemplates = templates?.data?.filter((t:any) => !t.is_active)

  const columns = [
    {
      key: 'title',
      header: 'Template Details',
      render: (item: any) => (
        <div className="py-2">
          <p className="font-extrabold text-slate-900 uppercase italic tracking-tight">{item.title}</p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mt-1">
            <Badge variant="outline" className="text-[8px] font-black border-slate-100 rounded-lg px-2 py-0">
              {item.total_days} Days
            </Badge>
            {item.description && (
              <>
                <span>/</span>
                <span className="text-blue-500/60 uppercase truncate max-w-[200px]">{item.description}</span>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            item.is_active ? "bg-emerald-500" : "bg-slate-400"
          )} />
          <span className="text-[12px] font-black uppercase tracking-widest text-slate-800 italic">
            {item.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      )
    },
    {
      key: 'modified',
      header: 'Last Modified',
      render: (item: any) => (
        <p className="text-[12px] font-bold text-slate-800 tabular-nums uppercase whitespace-nowrap">
          {new Date(item.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/dietitian/diet-plans/${item.id}?name=${encodeURIComponent(item.title.toLowerCase())}`}>
            <Button size="sm" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20 h-9 px-3">
              <Eye className="w-4 h-4 mr-1.5" />
              View Details
            </Button>
          </Link>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Diet Plan Management</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Manage clinical nutrition plans with precision.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        <StatCard
          title="Active Plans"
          value={activeTemplates?.length || 0}
          icon={Zap}
          subtitle="Active templates"
          gradient="from-[#1F56A3] to-[#192B42]"
          iconBg="bg-gradient-to-br from-[#1F56A3]/20 to-[#192B42]/20"
          iconColor="text-[#1F56A3]"
        />

        {/* <StatCard
          title="Draft Plans"
          value={inactiveTemplates?.length || 0}
          icon={Clock}
          subtitle="Inactive templates"
          gradient="from-[#1F56A3] to-[#192B42]"
          iconBg="bg-gradient-to-br from-[#1F56A3]/20 to-[#192B42]/20"
          iconColor="text-[#1F56A3]"
        /> */}
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search diet templates by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diet Plans Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-600">Error loading templates: {error.message}</p>
            </div>
          ) : (
            <DataTable
              data={filteredTemplates}
              columns={columns}
            />
          )}
        </CardContent>
      </Card>

      {/* Create New Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Create New Diet Template</DialogTitle>
            <DialogDescription className="text-slate-600">
              Create a reusable diet template that can be assigned to multiple patients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan-title" className="text-sm font-semibold text-slate-700">Template Title *</Label>
              <Input
                id="plan-title"
                placeholder="e.g., 15-Day Metabolism Reset"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="h-11 border-slate-300 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
              <Textarea
                id="description"
                placeholder="High-protein, clean-eating template for weight management..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="min-h-[80px] border-slate-300 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-slate-700">Total Days *</Label>
              <Input
                id="duration"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter number of days"
                value={planDuration}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setPlanDuration(value)
                }}
                className="h-11 border-slate-300 bg-white"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Ensure patient drinks 3-4 liters of water daily..."
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                className="min-h-[80px] border-slate-300 bg-white resize-none"
              />
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={createTemplateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
