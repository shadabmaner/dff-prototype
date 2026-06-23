"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login")
      return
    }

    const dept = user?.user_type || user?.department
    if (dept === "portal") {
      router.push("/portal/dashboard")
    } else if (dept) {
      router.push(`/dashboard/${dept}/dashboard`)
    } else {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
