"use client"

import * as React from "react"

import type {
  AppConfig,
  AuditEvent,
  CommunityPost,
  DepartmentPerformance,
  Kpi,
  Plan,
  RiskIndicator,
  Specialty,
  StaffMember,
  Testimonial,
  UserControl,
} from "@/components/admin/types"

type AdminContextValue = {
  kpis: Kpi[]
  departmentPerformance: DepartmentPerformance[]
  risks: RiskIndicator[]

  specialties: Specialty[]
  plans: Plan[]

  posts: CommunityPost[]
  userControls: UserControl[]

  testimonials: Testimonial[]

  staff: StaffMember[]

  config: AppConfig
  auditEvents: AuditEvent[]

  createSpecialty: (name: string) => void
  toggleSpecialty: (id: string) => void

  createPlan: (payload: Omit<Plan, "id">) => void
  togglePlan: (id: string) => void
  updatePlanPrice: (id: string, price: number) => void

  moderatePost: (id: string, status: "APPROVED" | "REJECTED") => void
  toggleBanUser: (userId: string) => void

  moderateTestimonial: (id: string, status: "APPROVED" | "REJECTED") => void

  toggleStaffActive: (id: string) => void

  setFeatureFlag: (key: string, enabled: boolean) => void
  setContentRules: (payload: Partial<AppConfig["contentRules"]>) => void
  setNotificationGovernance: (payload: Partial<AppConfig["notificationGovernance"]>) => void
}

const AdminContext = React.createContext<AdminContextValue | null>(null)

function nowISO() {
  return new Date().toISOString()
}

const seed = {
  kpis: [
    { id: "k1", label: "Active users", value: "1,284", delta: "+4.2%" },
    { id: "k2", label: "Pending approvals", value: "37", delta: "-3" },
    { id: "k3", label: "Open risk items", value: "6", delta: "+1" },
    { id: "k4", label: "Feature flags enabled", value: "12", delta: "+0" },
  ] as Kpi[],
  departmentPerformance: [
    { dept: "marketing", name: "Marketing", score: 78, openItems: 3 },
    { dept: "sales", name: "Sales", score: 72, openItems: 6 },
    { dept: "service", name: "Service", score: 80, openItems: 2 },
    { dept: "doctor", name: "Doctor", score: 76, openItems: 4 },
    { dept: "dietitian", name: "Dietitian", score: 74, openItems: 2 },
    { dept: "physio", name: "Physio", score: 70, openItems: 3 },
    { dept: "pharmacy", name: "Pharmacy", score: 82, openItems: 1 },
    { dept: "finance", name: "Finance", score: 79, openItems: 2 },
  ] as DepartmentPerformance[],
  risks: [
    {
      id: "r1",
      title: "High refund rate (Finance)",
      level: "HIGH",
      detail: "Refunds exceed threshold for last 7 days",
      createdAt: "2026-02-18T08:10:00.000Z",
    },
    {
      id: "r2",
      title: "Community spam spike",
      level: "MEDIUM",
      detail: "Moderation queue growing beyond SLA",
      createdAt: "2026-02-18T09:20:00.000Z",
    },
  ] as RiskIndicator[],
  specialties: [
    { id: "sp1", name: "Diabetology", isActive: true },
    { id: "sp2", name: "Cardiology", isActive: true },
    { id: "sp3", name: "Orthopedics", isActive: true },
  ] as Specialty[],
  plans: [
    { id: "pl1", specialtyId: "sp1", name: "Diabetes Care - 90 days", durationDays: 90, price: 15000, isActive: true },
    { id: "pl2", specialtyId: "sp2", name: "Cardio Care - 60 days", durationDays: 60, price: 18000, isActive: true },
    { id: "pl3", specialtyId: "sp3", name: "Ortho Recovery - 45 days", durationDays: 45, price: 12000, isActive: true },
  ] as Plan[],
  posts: [
    {
      id: "p1",
      authorName: "User A",
      authorId: "u1",
      title: "My sugar levels improved",
      body: "Sharing my journey...",
      createdAt: "2026-02-18T10:00:00.000Z",
      status: "PENDING",
    },
    {
      id: "p2",
      authorName: "User B",
      authorId: "u2",
      title: "Spam link",
      body: "Buy now http://...",
      createdAt: "2026-02-18T10:05:00.000Z",
      status: "PENDING",
    },
  ] as CommunityPost[],
  userControls: [
    { id: "uc1", userId: "u1", userName: "User A", isBanned: false },
    { id: "uc2", userId: "u2", userName: "User B", isBanned: false },
  ] as UserControl[],
  testimonials: [
    {
      id: "t1",
      type: "TEXT",
      title: "Great program",
      submittedBy: "Patient X",
      submittedAt: "2026-02-18T11:00:00.000Z",
      status: "PENDING",
      content: "Helped me a lot",
    },
    {
      id: "t2",
      type: "VIDEO",
      title: "Recovery story",
      submittedBy: "Patient Y",
      submittedAt: "2026-02-18T11:15:00.000Z",
      status: "PENDING",
      assetUrl: "https://example.com/video.mp4",
    },
  ] as Testimonial[],
  staff: [
    { id: "st1", name: "Dr. Anil", role: "doctor", isActive: true, specialty: "Cardiology" },
    { id: "st2", name: "Dietitian Riya", role: "dietitian", isActive: true, specialty: "Diabetology" },
    { id: "st3", name: "Physio Aman", role: "physio", isActive: true },
    { id: "st4", name: "Sales Neha", role: "sales", isActive: true },
    { id: "st5", name: "Pharmacist Kiran", role: "pharmacist", isActive: true },
  ] as StaffMember[],
  config: {
    featureFlags: {
      enableCommunity: true,
      enableVideoTestimonials: true,
      enablePatientPortal: true,
      enableSalesModule: true,
      enableFinanceModule: true,
    },
    notificationGovernance: {
      allowMarketingBroadcasts: false,
      allowPatientReminders: true,
      requireApprovalForBroadcasts: true,
    },
    contentRules: {
      communityAutoApprove: false,
      bannedWords: "spam,buy now,http",
    },
  } as AppConfig,
  auditEvents: [
    {
      id: "ae1",
      patientId: "PT-1001",
      patientName: "Aarav Mehta",
      actor: "sales-1",
      action: "Lead converted",
      at: "2026-02-18T09:12:00.000Z",
      metadata: { leadId: "LD-1003" },
    },
    {
      id: "ae2",
      patientId: "PT-1002",
      patientName: "Neha Sharma",
      actor: "doctor-1",
      action: "Appointment completed",
      at: "2026-02-18T10:45:00.000Z",
      metadata: { appointmentId: "APT-22" },
    },
  ] as AuditEvent[],
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [specialties, setSpecialties] = React.useState<Specialty[]>(seed.specialties)
  const [plans, setPlans] = React.useState<Plan[]>(seed.plans)
  const [posts, setPosts] = React.useState<CommunityPost[]>(seed.posts)
  const [userControls, setUserControls] = React.useState<UserControl[]>(seed.userControls)
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(seed.testimonials)
  const [staff, setStaff] = React.useState<StaffMember[]>(seed.staff)
  const [config, setConfig] = React.useState<AppConfig>(seed.config)

  const createSpecialty = React.useCallback((name: string) => {
    const item: Specialty = { id: `sp-${Math.random().toString(36).slice(2, 7)}`, name, isActive: true }
    setSpecialties((prev) => [item, ...prev])
  }, [])

  const toggleSpecialty = React.useCallback((id: string) => {
    setSpecialties((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }, [])

  const createPlan = React.useCallback((payload: Omit<Plan, "id">) => {
    const item: Plan = { ...payload, id: `pl-${Math.random().toString(36).slice(2, 7)}` }
    setPlans((prev) => [item, ...prev])
  }, [])

  const togglePlan = React.useCallback((id: string) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }, [])

  const updatePlanPrice = React.useCallback((id: string, price: number) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)))
  }, [])

  const moderatePost = React.useCallback((id: string, status: "APPROVED" | "REJECTED") => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  const toggleBanUser = React.useCallback((userId: string) => {
    setUserControls((prev) => prev.map((u) => (u.userId === userId ? { ...u, isBanned: !u.isBanned } : u)))
  }, [])

  const moderateTestimonial = React.useCallback((id: string, status: "APPROVED" | "REJECTED") => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])

  const toggleStaffActive = React.useCallback((id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }, [])

  const setFeatureFlag = React.useCallback((key: string, enabled: boolean) => {
    setConfig((prev) => ({ ...prev, featureFlags: { ...prev.featureFlags, [key]: enabled } }))
  }, [])

  const setContentRules = React.useCallback((payload: Partial<AppConfig["contentRules"]>) => {
    setConfig((prev) => ({ ...prev, contentRules: { ...prev.contentRules, ...payload } }))
  }, [])

  const setNotificationGovernance = React.useCallback(
    (payload: Partial<AppConfig["notificationGovernance"]>) => {
      setConfig((prev) => ({
        ...prev,
        notificationGovernance: { ...prev.notificationGovernance, ...payload },
      }))
    },
    []
  )

  const auditEvents = React.useMemo(() => seed.auditEvents, [])
  const kpis = React.useMemo(() => seed.kpis, [])
  const departmentPerformance = React.useMemo(() => seed.departmentPerformance, [])
  const risks = React.useMemo(() => seed.risks, [])

  const value = React.useMemo<AdminContextValue>(
    () => ({
      kpis,
      departmentPerformance,
      risks,
      specialties,
      plans,
      posts,
      userControls,
      testimonials,
      staff,
      config,
      auditEvents,
      createSpecialty,
      toggleSpecialty,
      createPlan,
      togglePlan,
      updatePlanPrice,
      moderatePost,
      toggleBanUser,
      moderateTestimonial,
      toggleStaffActive,
      setFeatureFlag,
      setContentRules,
      setNotificationGovernance,
    }),
    [
      kpis,
      departmentPerformance,
      risks,
      specialties,
      plans,
      posts,
      userControls,
      testimonials,
      staff,
      config,
      auditEvents,
      createSpecialty,
      toggleSpecialty,
      createPlan,
      togglePlan,
      updatePlanPrice,
      moderatePost,
      toggleBanUser,
      moderateTestimonial,
      toggleStaffActive,
      setFeatureFlag,
      setContentRules,
      setNotificationGovernance,
    ]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = React.useContext(AdminContext)
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider")
  return ctx
}

export function adminAuditEvent(payload: {
  patientId: string
  patientName: string
  actor: string
  action: string
  metadata?: Record<string, any>
}): AuditEvent {
  return {
    id: `ae-${Math.random().toString(36).slice(2, 7)}`,
    patientId: payload.patientId,
    patientName: payload.patientName,
    actor: payload.actor,
    action: payload.action,
    at: nowISO(),
    metadata: payload.metadata,
  }
}
