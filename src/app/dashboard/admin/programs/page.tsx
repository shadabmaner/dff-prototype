"use client"

import {
  Package,
  Plus,
  Search,
  Building2,
  Clock,
  IndianRupee,
  Power,
  ChevronRight,
  MoreHorizontal,
  Download,
  Filter,
  Layers,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import { useAdmin } from "@/components/admin/admin-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 }
}

export default function AdminProgramsPage() {
  const { specialties, plans, createPlan, togglePlan } = useAdmin()

  const [specialtyId, setSpecialtyId] = React.useState(specialties[0]?.id ?? "")
  const [name, setName] = React.useState("")
  const [durationDays, setDurationDays] = React.useState("90")
  const [price, setPrice] = React.useState("15000")

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Service Catalog</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Plan <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Management</span></h1>
          <p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-1">
            Design and deploy clinical subscription plans and duration parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm shadow-sm hover:bg-[var(--card)] transition-all">
            <Download className="mr-2 h-4 w-4 text-[var(--muted-foreground)]" />
            Export Catalog
          </Button>
        </div>
      </motion.div>

      {/* Creation card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="fresh-card-alt border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-4 md:items-end">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest pl-1">Specialty Taxonomy</label>
                <Select value={specialtyId} onValueChange={setSpecialtyId}>
                  <SelectTrigger className="h-14 rounded-[1.25rem] border-[var(--border)] bg-[var(--card)] focus:ring-primary/20 font-medium">
                    <SelectValue placeholder="Select Specialty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[var(--border)] shadow-2xl">
                    {specialties.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="rounded-lg">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest pl-1">Plan Moniker</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Care" className="h-14 rounded-[1.25rem] border-[var(--border)] bg-[var(--card)] focus:ring-primary/20 font-medium" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest pl-1">Cycle Duration (Days)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="90" className="pl-11 h-14 rounded-[1.25rem] border-[var(--border)] bg-[var(--card)] focus:ring-primary/20 font-medium" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest pl-1">Base Yield (INR)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" className="pl-11 h-14 rounded-[1.25rem] border-[var(--border)] bg-[var(--card)] focus:ring-primary/20 font-medium" />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => {
                  const n = name.trim()
                  const d = Number(durationDays)
                  const p = Number(price)
                  if (!specialtyId || !n || !Number.isFinite(d) || !Number.isFinite(p)) return
                  createPlan({
                    specialtyId,
                    name: n,
                    durationDays: d,
                    price: p,
                    isActive: true,
                  })
                  setName("")
                }}
                className="h-14 px-10 rounded-[1.25rem] bg-[var(--foreground)] hover:bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/5 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Deploy Plan Entity
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans list */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <Card className="fresh-card border-none shadow-xl overflow-hidden bg-white/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-primary" />
                <CardTitle className="text-xl font-black text-[var(--foreground)] tracking-tight">Active Subscriptions</CardTitle>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-black tracking-[0.2em]">Deployed platform programs</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--border)]">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Plan Entity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Governance</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Lifecycle</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Yield</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {plans.map((p, idx) => {
                    const sp = specialties.find((s) => s.id === p.specialtyId)
                    return (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group/row border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                      >
                        <TableCell className="pl-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-primary border border-white shadow-sm group-hover/row:scale-110 transition-transform">
                              <Layers className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-black text-[var(--foreground)] uppercase tracking-tight text-[14px]">{p.name}</p>
                              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-0.5">{sp?.name ?? p.specialtyId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border-none uppercase tracking-widest",
                            p.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          )}>
                            {p.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[var(--muted-foreground)] font-bold text-[13px]">
                            <Clock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                            {p.durationDays} days
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-black text-[var(--foreground)] tabular-nums text-[14px]">
                            <IndianRupee className="h-3 w-3" />
                            {p.price}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePlan(p.id)}
                              className={cn(
                                "h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                p.isActive ? "border-rose-100 text-rose-500 hover:bg-rose-50" : "border-emerald-100 text-emerald-500 hover:bg-emerald-50"
                              )}
                            >
                              <Power className="mr-2 h-3.5 w-3.5" />
                              {p.isActive ? "Disable" : "Enable"}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-[var(--muted)]">
                              <MoreHorizontal className="h-4 w-4 text-[var(--muted-foreground)]" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
