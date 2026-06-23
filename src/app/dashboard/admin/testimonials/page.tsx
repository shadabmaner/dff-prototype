"use client"

import {
  Quote,
  UserCheck,
  Video,
  FileCode,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useAdmin } from "@/components/admin/admin-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

export default function TestimonialsAdminPage() {
  const { testimonials, moderateTestimonial } = useAdmin()

  const pending = testimonials.filter((t) => t.status === "PENDING")

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
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Content Moderation</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Social <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Intelligence</span></h1>
          <p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-1">
            Govern patient success stories, video testimonials, and clinical endorsements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest bg-amber-50 text-amber-600 border-none shadow-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {pending.length} Pending Review
          </Badge>
        </div>
      </motion.div>

      {/* Pending Reviews */}
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
                <ShieldCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-xl font-black text-[var(--foreground)] tracking-tight">Approval Queue</CardTitle>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-black tracking-[0.2em]">Prioritize patient voice verification</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--border)]">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Content Spec</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] w-[40%]">Narrative</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Author</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Governance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {pending.length ? (
                    pending.map((t, idx) => (
                      <motion.tr
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group/row border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                      >
                        <TableCell className="pl-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border group-hover/row:scale-110 transition-transform",
                              t.type === "VIDEO" ? "bg-primary/10 text-primary border-primary/20" :
                                t.type === "DOCUMENT" ? "bg-amber-100 text-amber-600 border-amber-200" :
                                  "bg-[var(--muted)] text-[var(--muted-foreground)] border-white"
                            )}>
                              {t.type === "VIDEO" ? <Video className="h-5 w-5" /> :
                                t.type === "DOCUMENT" ? <FileCode className="h-5 w-5" /> :
                                  <Quote className="h-5 w-5" />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{t.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-black text-[var(--foreground)] uppercase tracking-tight text-[14px]">{t.title}</p>
                            {t.content && <p className="text-[12px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed italic">"{t.content}"</p>}
                            {t.assetUrl && (
                              <Button variant="link" className="h-auto p-0 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-1 group/link">
                                Review Asset <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[var(--muted-foreground)] font-bold text-[13px]">
                            <div className="h-6 w-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-[10px] text-[var(--muted-foreground)] uppercase font-black">
                              {t.submittedBy.slice(0, 2)}
                            </div>
                            {t.submittedBy}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => moderateTestimonial(t.id, "APPROVED")}
                              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200"
                            >
                              <ThumbsUp className="mr-2 h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => moderateTestimonial(t.id, "REJECTED")}
                              className="h-10 px-5 rounded-xl text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest"
                            >
                              <ThumbsDown className="mr-2 h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                          <ShieldCheck className="h-10 w-10 text-[var(--muted-foreground)]" />
                          <p className="text-[11px] font-black uppercase tracking-widest">Queue Clear</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* History Manifest */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <Card className="fresh-card-alt border-none shadow-xl overflow-hidden bg-white/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-xl font-black text-[var(--foreground)] tracking-tight">Full Archive</CardTitle>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-black tracking-[0.2em]">Comprehensive endorsement manifest</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--border)]">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Moniker</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Timestamp</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Protocol Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((t, idx) => (
                  <TableRow key={t.id} className="group/row border-[var(--border)] transition-colors hover:bg-[var(--muted)]/30">
                    <TableCell className="pl-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{t.type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-[var(--foreground)] text-[13px]">{t.title}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-[var(--foreground)] text-[12px]">{new Date(t.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{new Date(t.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-lg border-none uppercase tracking-widest shadow-sm",
                        t.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                          t.status === "REJECTED" ? "bg-rose-50 text-rose-500" :
                            "bg-amber-50 text-amber-600"
                      )}>
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
