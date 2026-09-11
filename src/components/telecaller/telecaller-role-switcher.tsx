"use client"

import * as React from "react"
import {
  PhoneCall,
  IndianRupee,
  Sparkles,
  Users,
  ChevronDown,
  Check,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  useTelecallerRoleStore,
  type TelecallerRoleType,
  ROLE_PROFILES,
} from "@/store/telecaller-role-store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const ROLE_ITEMS: {
  role: TelecallerRoleType
  title: string
  shortLabel: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badgeColor: string
  desc: string
}[] = [
  {
    role: "welcome_call",
    title: "Welcome Call Specialist",
    shortLabel: "Welcome Call",
    icon: PhoneCall,
    color: "text-emerald-700",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    desc: "Care team assignment & bonding onboarding calls",
  },
  {
    role: "payment_recovery",
    title: "Payment Recovery Specialist",
    shortLabel: "Payment Recovery",
    icon: IndianRupee,
    color: "text-amber-700",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "Program mapping, ₹2,499 token deduction & recovery",
  },
  {
    role: "residential_camp",
    title: "Residential Camp Booster",
    shortLabel: "Camp Booster",
    icon: Sparkles,
    color: "text-purple-700",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    desc: ">3 month patient reminders & retreat boost calls",
  },
  {
    role: "lead_nurture",
    title: "Lead Nurture Specialist",
    shortLabel: "Lead Nurture",
    icon: Users,
    color: "text-[#1F56A3]",
    badgeColor: "bg-blue-50 text-[#1F56A3] border-blue-200",
    desc: "Fresh inbound marketing leads & conversion pipeline",
  },
]

export function TelecallerRoleHeaderBadge() {
  const { currentRole, setCurrentRole } = useTelecallerRoleStore()
  const router = useRouter()
  const activeItem = ROLE_ITEMS.find((r) => r.role === currentRole) || ROLE_ITEMS[0]
  const Icon = activeItem.icon

  const handleSelect = (role: TelecallerRoleType) => {
    setCurrentRole(role)
    const profile = ROLE_PROFILES[role]
    toast.info(`Switched to ${profile.roleTitle}`, {
      description: `Active telecaller profile: ${profile.name} (${profile.department}).`,
    })
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-2 rounded-xl px-2.5 text-xs font-bold border transition-all shadow-sm ${activeItem.badgeColor}`}
        >
          <Icon className={`h-3.5 w-3.5 ${activeItem.color}`} />
          <span className="hidden sm:inline font-bold">Role: {activeItem.shortLabel}</span>
          <span className="sm:hidden font-bold">{activeItem.shortLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2 shadow-xl border-slate-200">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
          Switch Specialized Telecaller Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1">
          {ROLE_ITEMS.map((item) => {
            const ItemIcon = item.icon
            const isSelected = item.role === currentRole
            return (
              <DropdownMenuItem
                key={item.role}
                onClick={() => handleSelect(item.role)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? "bg-slate-100/90 font-bold" : "hover:bg-slate-50"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${item.badgeColor}`}>
                  <ItemIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TelecallerSidebarCard() {
  const { currentRole, setCurrentRole, getProfile } = useTelecallerRoleStore()
  const profile = getProfile()
  const activeItem = ROLE_ITEMS.find((r) => r.role === currentRole) || ROLE_ITEMS[0]
  const Icon = activeItem.icon

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-blue-50/20 p-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Active Telecaller
        </span>
        <Badge className={`text-[9px] font-bold py-0 ${activeItem.badgeColor}`}>
          {activeItem.shortLabel}
        </Badge>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-[#1F56A3] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          {profile.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">{profile.name}</p>
          <p className="text-[10px] text-slate-500 truncate">{profile.roleTitle}</p>
        </div>
      </div>

      <div className="pt-1">
        <TelecallerRoleHeaderBadge />
      </div>
    </div>
  )
}
