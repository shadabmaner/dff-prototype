"use client"

import * as React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { NotificationPanel } from "@/components/layout/notification-panel"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved === "true") setIsCollapsed(true)
  }, [])

  const toggleSidebar = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem("sidebar-collapsed", String(nextState))
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background transition-all duration-300">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader onOpenNotifications={() => setNotifOpen(true)} />
          <main className="flex-1 px-5 py-5 md:px-6 md:py-6">
            <div className="mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </ProtectedRoute>
  )
}
