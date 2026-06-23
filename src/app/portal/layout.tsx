"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
