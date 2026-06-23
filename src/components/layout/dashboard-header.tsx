"use client"

import * as React from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, ChevronRight } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useLead } from "@/hooks/use-leads"
import { useNotifications } from "@/hooks/use-notifications"

function titleize(s: string) {
  return s
    .split("-")
    .filter(Boolean)
    .map((p) => p.slice(0, 1).toUpperCase() + p.slice(1))
    .join(" ")
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getInitials(source?: string) {
  if (!source) return "US"
  const cleaned = source.trim()
  if (!cleaned) return "US"
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function DashboardHeader({ onOpenNotifications }: { onOpenNotifications?: () => void }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { unreadCount } = useNotifications()

  const specialityNameParam = searchParams?.get("specialityName") ?? undefined
  const courseNameParam = searchParams?.get("courseName") ?? undefined
  const contextName = courseNameParam ?? specialityNameParam

  // Extract patient name from query parameters
  const firstNameParam = searchParams?.get("first_name") ?? undefined
  const lastNameParam = searchParams?.get("last_name") ?? undefined
  const nameParam = searchParams?.get("name") ?? undefined
  const patientName = nameParam || (firstNameParam && lastNameParam ? `${firstNameParam} ${lastNameParam}` : firstNameParam || lastNameParam)

  // Extract lead ID from pathname if we're on a lead details page
  const leadId = React.useMemo(() => {
    const parts = pathname.split("/")
    const leadsIndex = parts.indexOf("leads")
    if (leadsIndex !== -1 && parts[leadsIndex + 1]) {
      const potentialId = parts[leadsIndex + 1]
      if (UUID_REGEX.test(potentialId)) {
        return potentialId
      }
    }
    return null
  }, [pathname])

  // Fetch lead data if we have a lead ID
  const { data: lead, isLoading: leadLoading } = useLead(leadId || undefined, { enabled: Boolean(leadId) })

  const userRole = user?.user_type as string | undefined
  const isAdminOrSuperAdmin = userRole === "admin" || userRole === "superadmin" || userRole === "super_admin"

  const segments = React.useMemo(() => {
    const p = pathname.split("?")[0]
    const rawParts = p.split("/").filter(Boolean)

    let segmentsArr = rawParts.map((raw, index) => {
      let href = "/" + rawParts.slice(0, index + 1).join("/")

      // If non-admin clicking "Dashboard", redirect directly to their specific module's dashboard URL
      if (!isAdminOrSuperAdmin && raw === "dashboard" && userRole) {
        const roleLower = userRole.toLowerCase()
        const roleToDashboard: Record<string, string> = {
          dietitian: "/dashboard/dietitian/dashboard",
          sales: "/dashboard/sales/dashboard",
          doctor: "/dashboard/doctor/dashboard",
          service_operations: "/dashboard/service/dashboard",
          service: "/dashboard/service/dashboard",
          marketing: "/dashboard/marketing/dashboard",
          tele_caller: "/dashboard/telecaller",
          telecaller: "/dashboard/telecaller",
          fitness_coach: "/dashboard/fitness-coach/dashboard",
          pharmacist: "/dashboard/pharmacy/dashboard",
          pharmacy: "/dashboard/pharmacy/dashboard",
          finance: "/dashboard/finance/dashboard",
        }

        if (roleToDashboard[roleLower]) {
          href = roleToDashboard[roleLower]
        } else if (rawParts.length > 1) {
          // Fallback to deducing from URL if role mapping is missing
          const moduleName = rawParts[1].toLowerCase()
          const hiddenModules = ["dietitian", "sales", "doctor", "service", "physio", "receptionist", "nurse", "marketing", "pharmacy", "finance"]
          if (hiddenModules.includes(moduleName)) {
            href = `/dashboard/${moduleName}`
          }
        }
      }

      return { raw, label: titleize(raw), href }
    })

    // Special handling for assignment-results page - remove the job ID
    const assignmentResultsIndex = segmentsArr.findIndex(s => s.raw === "assignment-results")
    if (assignmentResultsIndex !== -1 && segmentsArr[assignmentResultsIndex + 1] && UUID_REGEX.test(segmentsArr[assignmentResultsIndex + 1].raw)) {
      segmentsArr.splice(assignmentResultsIndex + 1, 1)
    }

    // Special handling for leads pages - replace UUID with lead name
    const leadsIndex = segmentsArr.findIndex(s => s.raw === "leads")
    if (leadsIndex !== -1 && segmentsArr[leadsIndex + 1] && UUID_REGEX.test(segmentsArr[leadsIndex + 1].raw)) {
      if (lead?.patientName) segmentsArr[leadsIndex + 1].label = lead.patientName
      else if (lead?.name) segmentsArr[leadsIndex + 1].label = lead.name
      else if (patientName) segmentsArr[leadsIndex + 1].label = patientName
      else if (leadLoading) segmentsArr[leadsIndex + 1].label = "Loading..."
    }

    // Special handling for patients pages - replace UUID with patient name
    const patientsIndex = segmentsArr.findIndex(s => s.raw === "patients")
    if (patientsIndex !== -1) {
      // If we came from appointments, make the "Patients" (or whatever the parent segment is) 
      // link back to appointments with the correct tab
      const ref = searchParams?.get("ref")
      const tab = searchParams?.get("tab")
      if (ref === "appointments") {
        segmentsArr[patientsIndex].href = `/dashboard/dietitian/appointments${tab ? `?tab=${tab}` : ""}`
      } else if (ref === "patient-requests") {
        segmentsArr[patientsIndex].href = `/dashboard/dietitian/patient-requests`
      }

      if (segmentsArr[patientsIndex + 1] && UUID_REGEX.test(segmentsArr[patientsIndex + 1].raw)) {
        if (patientName) {
          segmentsArr[patientsIndex + 1].label = patientName
        }
      }
    }

    // Special handling for pending-assessment pages - replace UUID with patient name
    const assessmentIndex = segmentsArr.findIndex(s => s.raw === "pending-assessment")
    if (assessmentIndex !== -1 && segmentsArr[assessmentIndex + 1] && UUID_REGEX.test(segmentsArr[assessmentIndex + 1].raw)) {
      if (patientName) {
        segmentsArr[assessmentIndex + 1].label = patientName
      }
    }

    let finalSegments = segmentsArr.slice(0, 4)

    if (!isAdminOrSuperAdmin) {
      const hiddenModules = [
        "dietitian", "sales", "doctor", "service", "admin", "physio",
        "receptionist", "nurse", "marketing", "telecaller", "pharmacy",
        "finance", "fitness-coach", "super-admin"
      ]
      finalSegments = finalSegments.filter(seg => !hiddenModules.includes(seg.raw.toLowerCase()))
    }

    return finalSegments.map((segment) => {
      // If this is a UUID and we have lead data, use the lead name fallback
      if (UUID_REGEX.test(segment.raw) && segment.label === titleize(segment.raw)) {
        if (lead?.patientName) {
          segment.label = lead.patientName
        } else if (lead?.name) {
          segment.label = lead.name
        } else if (patientName) {
          segment.label = patientName
        } else if (contextName) {
          segment.label = contextName
        } else if (leadLoading) {
          segment.label = "Loading..."
        }
      }
      return segment
    })
  }, [pathname, contextName, lead, leadLoading, patientName, isAdminOrSuperAdmin])

  const displayName = React.useMemo(() => {
    if (!user) return "User"
    //@ts-ignore
    return user.name || (user as any).full_name || user.email?.split("@")[0] || "User"
  }, [user])

  const role = user?.user_type ? user.user_type.replace(/_/g, " ") : undefined
  const detail = user?.email ?? user?.phone ?? undefined

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="flex h-[56px] items-center gap-4 px-5 md:px-6">
        {/* Breadcrumb */}
        <nav className="hidden items-center gap-1 text-[13px] uppercase tracking-[0.06em] md:flex">
          {segments.map((segment, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/70 mx-0.5" />}
              {i === segments.length - 1 ? (
                <span className="font-bold text-foreground">
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className="text-muted-foreground font-medium hover:text-foreground hover:underline transition-colors"
                >
                  {segment.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {contextName && (
          <div className="hidden items-center rounded-lg border border-border/40 bg-muted/40 px-3 py-1 text-[11px] font-semibold text-foreground/80 md:flex">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 mr-2">Course</span>
            <span className="line-clamp-1 max-w-[160px]">{contextName}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 rounded-lg hover:bg-muted/60 transition-colors"
            onClick={onOpenNotifications}
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="mx-1.5 h-4 w-px bg-border/60" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 rounded-lg px-2 hover:bg-muted/60 transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white text-[9px] font-bold capitalize">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-[12px] font-bold leading-none text-foreground capitalize">{displayName}</div>
                  <div className="text-muted-foreground text-[10px] mt-1.5 leading-none uppercase font-bold tracking-tight opacity-70">
                    {role ?? ""}
                    {/* {detail ? ` · ${detail}` : ""} */}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-lg shadow-lg border-border/50">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[13px] cursor-pointer"
                onClick={() => router.push("/dashboard/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[13px] cursor-pointer"
                onClick={() => {
                  void signOut()
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
