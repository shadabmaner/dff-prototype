"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { Icons } from "@/components/icons"
import { useAuth } from "@/contexts/auth-context"

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [status, router, pathname])

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") return null

  return <>{children}</>
}
