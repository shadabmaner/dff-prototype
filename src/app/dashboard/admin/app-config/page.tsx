"use client"

import * as React from "react"
import { useAdmin } from "@/components/admin/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Settings,
  Layers,
  Bell,
  FileCode,
  ShieldCheck,
  Save,
  Check,
  X,
  Lock,
  Zap,
  Clock,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function FlagRow({
  name,
  enabled,
  onToggle,
  icon: Icon = Zap,
}: {
  name: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  icon?: any
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] p-4 hover:bg-[var(--card)] hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
          enabled ? "bg-primary/10 text-primary" : "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:scale-110"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-black text-[var(--foreground)] uppercase tracking-tight text-[13px]">{name}</div>
      </div>
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!enabled)}
        className={cn(
          "h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
          enabled ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : "border-[var(--border)] text-[var(--muted-foreground)]"
        )}
      >
        {enabled ? (
          <><Check className="mr-1.5 h-3.5 w-3.5" /> Enabled</>
        ) : (
          <><X className="mr-1.5 h-3.5 w-3.5" /> Disabled</>
        )}
      </Button>
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export default function AppConfigPage() {
  const { config, setFeatureFlag, setContentRules, setNotificationGovernance } = useAdmin()
  const [bannedWords, setBannedWords] = React.useState(config.contentRules.bannedWords)

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
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">System Parameters</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">App <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Configuration</span></h1>
          <p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-1">
            Orchestrate feature enablement, notification logic, and global content constraints.
          </p>
        </div>
        <Button className="h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-white shadow-xl shadow-[var(--foreground)]/20">
          <Lock className="mr-2 h-4 w-4" />
          System Lock
        </Button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-8"
      >
        {/* Feature Enablement card */}
        <motion.div variants={item}>
          <Card className="fresh-card border-none shadow-xl overflow-hidden bg-white/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xl font-black text-[var(--foreground)] tracking-tight">Core Capabilities</CardTitle>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-black tracking-[0.2em]">Toggle platform feature access</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(config.featureFlags).map(([k, v]) => (
                <FlagRow key={k} name={k} enabled={v} onToggle={(enabled) => setFeatureFlag(k, enabled)} />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Notification Governance card */}
          <motion.div variants={item}>
            <Card className="h-full fresh-card-alt border-none shadow-xl overflow-hidden bg-white/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-rose-500" />
                    <CardTitle className="text-xl font-black text-[var(--foreground)] tracking-tight">Notification Logic</CardTitle>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-black tracking-[0.2em]">Orchestrate global alert sequence</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <FlagRow
                  name="Marketing Overlays"
                  icon={Zap}
                  enabled={config.notificationGovernance.allowMarketingBroadcasts}
                  onToggle={(enabled) => setNotificationGovernance({ allowMarketingBroadcasts: enabled })}
                />
                <FlagRow
                  name="Patient Reminders"
                  icon={Clock}
                  enabled={config.notificationGovernance.allowPatientReminders}
                  onToggle={(enabled) => setNotificationGovernance({ allowPatientReminders: enabled })}
                />
                <FlagRow
                  name="Require Auth"
                  icon={ShieldCheck}
                  enabled={config.notificationGovernance.requireApprovalForBroadcasts}
                  onToggle={(enabled) => setNotificationGovernance({ requireApprovalForBroadcasts: enabled })}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Rules card */}
          <motion.div variants={item}>
            <Card className="h-full fresh-card-alt border-none shadow-xl overflow-hidden bg-white/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode className="h-4 w-4 text-emerald-500" />
                    <CardTitle className="text-xl font-black text-[var(--foreground)] tracking-tight">Content Constraints</CardTitle>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-black tracking-[0.2em]">Global text filters and rules</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <FlagRow
                  name="Auto-Approval"
                  icon={Check}
                  enabled={config.contentRules.communityAutoApprove}
                  onToggle={(enabled) => setContentRules({ communityAutoApprove: enabled })}
                />
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest pl-1">Restricted Keywords Manifest</div>
                  <div className="relative group">
                    <Input
                      value={bannedWords}
                      onChange={(e) => setBannedWords(e.target.value)}
                      className="h-14 rounded-[1.25rem] border-[var(--border)] bg-[var(--card)]/80 pr-12 focus:bg-[var(--card)] focus:ring-primary/20 transition-all font-medium italic"
                      placeholder="e.g. spam, malicious, unauthorized..."
                    />
                    <Button
                      size="icon"
                      onClick={() => setContentRules({ bannedWords })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-[var(--foreground)] hover:bg-primary shadow-lg shadow-black/10 transition-all"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] px-1 italic">Comma-separated values for automated content scanning.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
