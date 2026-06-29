"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Activity,
  Apple,
  ArrowUpRight,
  BarChart,
  Bell,
  BookOpen,
  Box,
  Brain,
  Briefcase,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Download,
  Droplets,
  Dumbbell,
  FileText,
  FilePlus,
  Filter,
  FlaskConical,
  GraduationCap,
  Headset,
  HeartPulse,
  History,
  IndianRupee,
  LayoutDashboard,
  Layers,
  Loader2,
  LogOut,
  Medal,
  Megaphone,
  MessageSquare,
  Package,
  Palette,
  PhoneCall,
  Pill,
  Quote,
  Receipt,
  RefreshCcw,
  RotateCcw,
  Scale,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Split,
  Stethoscope,
  Tags,
  Target,
  Truck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Utensils,
  Video,
  Wrench,
  Zap,
  ListTodo,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  roles?: string[]
  badge?: string
  hint?: string
}

type NavSection = {
  label: string
  description?: string
  user_type?: string
  items: NavItem[]
}

const sections: NavSection[] = [
  // {
  //   label: "Overview",
  //   description: "Global visibility",
  //   items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, hint: "Mission control", roles: ["admin", "super_admin"] }],
  // },
  {
    label: "Marketing",
    description: "Grow the funnel",
    user_type: "marketing",
    items: [
      { title: "Dashboard", href: "/dashboard/marketing/dashboard", icon: LayoutDashboard },
      { title: "Campaigns", href: "/dashboard/marketing/campaigns", icon: Target, badge: "Live" },
      { title: "Requested Campaigns", href: "/dashboard/marketing/campaigns/requested", icon: ClipboardList },
      { title: "Leads", href: "/dashboard/marketing/leads", icon: Users },
    ],
  },
  {
    label: "",
    // description: "Pipeline execution",
    user_type: "sales",
    items: [
      { title: "Dashboard", href: "/dashboard/sales/dashboard", icon: PhoneCall },
      { title: "Lead Assignment", href: "/dashboard/sales/lead-assignment", icon: CalendarDays },
      { title: "Lead Management", href: "/dashboard/sales/leads", icon: Users },
      { title: "Call Log", href: "/dashboard/sales/calling-desk", icon: Headset },
      { title: "Telecallers", href: "/dashboard/sales/telecallers", icon: UserCheck },
      // { title: "Webinar Status", href: "/dashboard/sales/webinar-status", icon: Video },
      // { title: "Payment Funnel", href: "/dashboard/sales/payment-funnel", icon: Filter, badge: "Beta" },
      // { title: "Assessment Tracking", href: "/dashboard/sales/assessment-tracking", icon: ClipboardCheck },
      // { title: "Recovery View (Read Only)", href: "/dashboard/sales/recovery-view", icon: RefreshCcw },
      // { title: "Reports", href: "/dashboard/sales/reports", icon: BarChart },
    ],
  },
  {
    label: "Telecaller",
    description: "Call management",
    user_type: "tele_caller",
    items: [
      { title: "Dashboard", href: "/dashboard/telecaller", icon: LayoutDashboard },
      { title: "Assigned Leads", href: "/dashboard/telecaller/assigned-leads", icon: Users },
      { title: "Call Log", href: "/dashboard/telecaller/call-desk", icon: Headset },
    ],
  },
  {
    label: "Service",
    description: "Care orchestration",
    user_type: "service_operations",
    items: [
      { title: "Dashboard", href: "/dashboard/service/dashboard", icon: Activity },
      { title: "Welcome Call Management", href: "/dashboard/service/welcome-call-management", icon: PhoneCall },
      { title: "History Call Management", href: "/dashboard/service/pending-assessment", icon: ClipboardCheck },
      { title: "Patient Management", href: "/dashboard/service/patients", icon: Users },
      { title: "Mentor Management", href: "/dashboard/service/mentor-management", icon: GraduationCap },
      { title: "Kit Management", href: "/dashboard/service/kit-management", icon: Package },
      { title: "Staff Management", href: "/dashboard/service/staff", icon: UserCog },
      { title: "Prerequisites", href: "/dashboard/service/prerequisites", icon: FileText },
      { title: "Webinar Management", href: "/dashboard/service/webinar-management", icon: Video },
      { title: "Smart Batch Management", href: "/dashboard/service/smart-batch-management", icon: Layers },
      { title: "Batch Configuration", href: "/dashboard/service/batch-configuration", icon: Settings },
      { title: "Batch Planning", href: "/dashboard/service/batch-planning", icon: Calendar },
      { title: "Auto Batch Engine", href: "/dashboard/service/auto-batch-engine", icon: Zap },
      { title: "Patient Allocation", href: "/dashboard/service/patient-allocation", icon: UserPlus },
      { title: "Resource Allocation", href: "/dashboard/service/resource-allocation", icon: Users },
      { title: "Capacity Planning", href: "/dashboard/service/capacity-planning", icon: BarChart },
      { title: "Manual Override", href: "/dashboard/service/manual-override", icon: Settings2 },
      { title: "Bulk Reallocation", href: "/dashboard/service/bulk-reallocation", icon: RefreshCcw },
      // { title: "Assignments", href: "/dashboard/service/assignments", icon: UserCheck },
      // { title: "Plan Change Requests", href: "/dashboard/service/plan-changes", icon: RefreshCcw },
      // { title: "Mobile App Logs", href: "/dashboard/service/app-logs", icon: Activity },
      // { title: "Payments", href: "/dashboard/service/payments", icon: IndianRupee },
      // { title: "Reports", href: "/dashboard/service/reports", icon: BarChart },
    ],
  },
  {
    label: "Doctor",
    description: "Clinical cockpit",
    user_type: "doctor",
    items: [
      { title: "Doctor Management", href: "/dashboard/doctor/doctor-management", icon: UserCog },
      { title: "Dashboard", href: "/dashboard/doctor/dashboard", icon: LayoutDashboard },
      { title: "Appointments", href: "/dashboard/doctor/appointments", icon: Calendar },
      { title: "Referred Patients", href: "/dashboard/doctor/referred-patients", icon: UserPlus },
      { title: "Patient Requests", href: "/dashboard/doctor/patient-requests", icon: ClipboardList },
      { title: "Patient Management ", href: "/dashboard/doctor/patients", icon: Users },
      { title: "Patient Journey", href: "/dashboard/doctor/patient-journey", icon: History },
      { title: "Prescription Management", href: "/dashboard/doctor/prescription-management", icon: Pill },
      { title: "Availability", href: "/dashboard/doctor/availability", icon: Clock },
      { title: "Messages", href: "/dashboard/doctor/messages", icon: MessageSquare },
      // { title: "Reports", href: "/dashboard/doctor/reports", icon: BarChart },
    ],
  },
  {
    label: "Fitness Coach",
    description: "Training command",
    user_type: "fitness_coach",
    items: [
      { title: "Dashboard", href: "/dashboard/fitness-coach/dashboard", icon: LayoutDashboard },
      { title: "Appointments", href: "/dashboard/fitness-coach/appointments", icon: Calendar },
      { title: "Patient Requests", href: "/dashboard/fitness-coach/patient-requests", icon: ClipboardList },
      { title: "Referred Patients", href: "/dashboard/fitness-coach/referred-patients", icon: UserPlus },
      { title: "Patient Management", href: "/dashboard/fitness-coach/patients", icon: Users },
      { title: "Availability", href: "/dashboard/fitness-coach/availability", icon: Clock },
      { title: "Messages", href: "/dashboard/fitness-coach/messages", icon: MessageSquare },
      // { title: "Reports", href: "/dashboard/fitness-coach/reports", icon: BarChart },
    ],
  },
  {
    label: "Dietitian",
    description: "Nutrition control",
    user_type: "dietitian",
    items: [
      { title: "Dashboard", href: "/dashboard/dietitian/dashboard", icon: LayoutDashboard },
      { title: "Today's Appointments", href: "/dashboard/dietitian/appointments", icon: Calendar },
      // { title: "Reschedule Requests", href: "/dashboard/dietitian/reschedule-requests", icon: RefreshCcw },
      { title: "Patient Requests", href: "/dashboard/dietitian/patient-requests", icon: ClipboardList },
      { title: "Patient Management", href: "/dashboard/dietitian/patients", icon: Users },
      { title: "Messages", href: "/dashboard/dietitian/messages", icon: MessageSquare },
      { title: "Availability", href: "/dashboard/dietitian/availability", icon: Clock },
      { title: "Diet Plan Management", href: "/dashboard/dietitian/diet-plans", icon: Utensils },
      { title: "Grocery Management", href: "/dashboard/dietitian/grocery-management", icon: ShoppingCart },
      // { title: "Reports", href: "/dashboard/dietitian/reports", icon: BarChart },
    ],
  },
  {
    label: "Pharmacy",
    description: "Medication management",
    user_type: "pharmacist",
    items: [
      { title: "Dashboard", href: "/dashboard/pharmacy/dashboard", icon: LayoutDashboard },
      { title: "Prescription Management", href: "/dashboard/pharmacy/prescription-management", icon: FileText },
      { title: "Packing Management", href: "/dashboard/pharmacy/packing-management", icon: Package },
      { title: "Payment Management", href: "/dashboard/pharmacy/payment-management", icon: IndianRupee },
      { title: "Dispatch & Tracking", href: "/dashboard/pharmacy/dispatch-tracking", icon: Truck },
      { title: "Medication Master", href: "/dashboard/pharmacy/medication-master", icon: Pill },
      { title: "Revenue Reports", href: "/dashboard/pharmacy/revenue-reports", icon: BarChart },
    ],
  },
  {
    label: "Physio",
    description: "Therapy workflows",
    user_type: "physio",
    items: [
      { title: "Dashboard", href: "/dashboard/physio/dashboard", icon: Activity },
      { title: "Assigned Patients", href: "/dashboard/physio/assigned-patients", icon: Users },
      { title: "Sessions", href: "/dashboard/physio/sessions", icon: Clock },
    ],
  },
  {
    label: "Finance",
    description: "Cash clarity",
    user_type: "finance",
    items: [
      { title: "Dashboard", href: "/dashboard/finance/dashboard", icon: IndianRupee },
      { title: "Transactions", href: "/dashboard/finance/transactions", icon: History },
      { title: "Pending Payments", href: "/dashboard/finance/pending-payments", icon: Clock },
      { title: "Phase Payments", href: "/dashboard/finance/phase-payments", icon: Layers },
      { title: "Recovery", href: "/dashboard/finance/recovery", icon: RefreshCcw },
      // { title: "Installments", href: "/dashboard/finance/installments", icon: CalendarDays },
      // { title: "Refunds", href: "/dashboard/finance/refunds", icon: RotateCcw },
      // { title: "Revenue Allocation", href: "/dashboard/finance/revenue-allocation", icon: Split },
      // { title: "Reports", href: "/dashboard/finance/reports", icon: BarChart },
    ],
  },
  {
    label: "Admin",
    description: "Control center",
    user_type: "admin",
    items: [
      { title: "Dashboard", href: "/dashboard/admin/dashboard", icon: Shield },
      { title: "Program Management", href: "/dashboard/admin/program-management", icon: Settings2 },
      { title: "Patient Management", href: "/dashboard/admin/patients", icon: Users },
      { title: "Staff Management", href: "/dashboard/admin/staff-management", icon: UserCog },
      { title: "Assessment Management", href: "/dashboard/admin/assessments", icon: ClipboardList },
      // { title: "Patient Management", href: "/dashboard/admin/patient-management", icon: ClipboardList },

      { title: "Prerequisites", href: "/dashboard/admin/prerequisites", icon: FileText },
      { title: "Knowledge Base", href: "/dashboard/admin/knowledge-base", icon: BookOpen },
      { title: "Course Management", href: "/dashboard/admin/courses", icon: GraduationCap },
      { title: "Exercise Content", href: "/dashboard/admin/exercise-content", icon: Dumbbell },
      // { title: "Mindset Management", href: "/dashboard/admin/mindset-management", icon: Brain },
      // { title: "Specialties", href: "/dashboard/admin/specialties", icon: Medal },
      { title: "Community Management", href: "/dashboard/admin/community", icon: MessageSquare },
      { title: "Announcements", href: "/dashboard/admin/announcements", icon: Bell },
      { title: "Notification Templates", href: "/dashboard/admin/notification-templates", icon: Megaphone },
      { title: "SDUI Management", href: "/dashboard/admin/sdui-configs", icon: Layers },
      { title: "Webinar Management", href: "/dashboard/admin/webinar-management", icon: Video },
    ],
  },
  {
    label: "Super Admin",
    description: "Platform switches",
    user_type: "superadmin",
    items: [
      { title: "Medical Specialities", href: "/dashboard/super-admin/specialities", icon: Stethoscope, roles: ["superadmin"] },
      { title: "Action Palette", href: "/dashboard/super-admin/action-palette", icon: Palette, roles: ["superadmin"] },
    ],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = user?.user_type as string | undefined
  const name = ((user as any)?.name as string | undefined) ?? user?.email?.split("@")[0] ?? "User"
  const email = user?.email ?? ""
  const canViewAllSections = role === "admin" || role === "super_admin"

  const visibleSections = sections
    .filter((section) => {
      if (!section.user_type) return true
      return section.user_type == role
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((link: any) => {
        if (link.user_type?.length) {
          return role ? link.user_type.includes(role) : false
        }
        if (link.roles?.length) {
          return role ? link.roles.includes(role) : false
        }
        return true
      }),
    }))
    .filter((section) => section.items.length > 0)
  const shortcutItems = visibleSections.flatMap((section) => section.items.slice(0, 1)).slice(0, 3)
  const displayRole = role?.replace(/_/g, " ") ?? "User"

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen hidden shrink-0 flex-col border-r border-white/5 bg-[#0c1425] text-white transition-[width] duration-300 ease-out md:flex",
        isCollapsed ? "w-[88px]" : "w-[304px]"
      )}
      aria-label="Primary navigation"
    >
      <BackgroundDecor />

      <BrandRegion isCollapsed={isCollapsed} onToggle={onToggle} />

      <div className={cn("relative z-10 border-b border-white/10 px-4 py-4", isCollapsed && "px-2")}>
        <RoleCard isCollapsed={isCollapsed} role={displayRole} shortcuts={shortcutItems} />
      </div>

      <div className="relative z-10 flex-1 overflow-auto py-4">
        <nav className="space-y-6 px-3">
          {visibleSections.map((section) => (
            <div key={section.label} className="space-y-1">
              {!isCollapsed && (
                <div className="px-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  <div>{section.label}</div>
                  {section.description && (
                    <p className="mt-0.5 text-[11px] lowercase tracking-normal text-white/40">
                      {section.description}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                  return <SidebarLink key={link.href} link={link} isCollapsed={isCollapsed} isActive={isActive} />
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <SidebarFooter isCollapsed={isCollapsed} name={name} email={email} />
    </aside>
  )
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.15),_transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(30,64,175,0.1),_transparent_50%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
    </div>
  )
}

function BrandRegion({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-20 items-center border-b border-white/10",
        isCollapsed ? "justify-center" : "gap-3 px-6"
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
        {/* <HeartPulse className="h-5 w-5 text-white" /> */}
        <Image width={42} height={42} alt="" src={"https://onpointnexus.com/logo-icon.png"}/>
      </div>
      {!isCollapsed && (
        <div className="space-y-0.5">
          <p className="text-lg font-black tracking-tight">Medikiz Nexus</p>
          <p className="text-xs font-medium text-white/60">Unified healthcare OS</p>
        </div>
      )}
      <button
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`fixed cursor-pointer top-15 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0c1425] text-white/70 shadow-lg transition-colors hover:bg-primary hover:text-white ${isCollapsed ? "left-[70px]":"left-[283px]"}`}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  )
}

function RoleCard({
  isCollapsed,
  role,
  shortcuts,
}: {
  isCollapsed: boolean
  role: string
  shortcuts: NavItem[]
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/5 px-4 py-3 text-white shadow-inner shadow-black/20",
        isCollapsed && "px-2"
      )}
    >
      {!isCollapsed ? (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">Current Role</p>
          <p className="mt-1 text-base font-bold tracking-tight uppercase">{role}</p>

        </>
      ) : (
        <p className="text-center text-[10px] font-semibold uppercase">Role</p>
      )}
    </div>
  )
}

function SidebarLink({
  link,
  isCollapsed,
  isActive,
}: {
  link: NavItem
  isCollapsed: boolean
  isActive: boolean
}) {
  const Icon = link.icon
  const router = useRouter()
  return (
    <Link
      href={link.href}
      prefetch={false}
      onClick={() => {
        router.refresh()
      }}
      className={cn(
        "group relative flex items-center rounded-xl text-sm font-semibold text-white/80 transition-all",
        isCollapsed ? "justify-center py-2.5" : "gap-3 px-4 py-3",
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/30"
          : "hover:bg-white/5 hover:text-white"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
            "shrink-0",
            isActive ? "text-white" : "text-white/70"
          )}
        />
      )}
      {!isCollapsed && (
        <div className="flex-1 truncate">
          <div className="flex items-center gap-2">
            <span>{link.title}</span>
            {link.badge && (
              <span className="rounded-full bg-white/15 px-2 py-px text-[10px] font-semibold uppercase tracking-wide">
                {link.badge}
              </span>
            )}
          </div>
          {link.hint && <p className="text-[11px] font-medium text-white/50">{link.hint}</p>}
        </div>
      )}

      {isCollapsed && (
        <div className="invisible fixed left-[72px] z-[9999] ml-2 animate-in fade-in slide-in-from-left-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1.5 text-[11px] font-bold text-background shadow-xl ring-1 ring-border group-hover:visible">
          {link.title}
        </div>
      )}

      {/* {isActive && !isCollapsed && <span className="absolute inset-y-1 left-1 w-1 rounded-full bg-white/50" />} */}
    </Link>
  )
}

function SidebarFooter({ isCollapsed, name, email }: { isCollapsed: boolean; name: string; email: string }) {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      // Clear any stored navigation state to prevent redirect to previous page after login
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/auth/login')
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="mt-auto border-t border-white/10 px-4 py-4 text-white/80">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-md shadow-black/20">
          {name.slice(0, 2).toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-[12px] text-white/60">{email || "user@healthplus.com"}</p>
          </div>
        )}
      </div>
      <button
        onClick={handleLogout}
        className={cn(
          "mt-4 flex w-full items-center cursor-pointer gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5",
          isCollapsed && "justify-center"
        )}
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span>Sign Out</span>}
      </button>
    </div>
  )
}
