"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import type { User as AuthUser } from '@/types/auth'
import { deinitFCM } from '@/hooks/use-fcm'
import { clearSharedQueryClient } from '@/components/providers/query-provider'

type UserRole =
  | "admin"
  | "superadmin"
  | "doctor"
  | "dietitian"
  | "physio"
  | "sales"
  | "marketing"
  | "finance"
  | "service_operations"
  | "pharmacy"
  | "nurse"
  | "receptionist"
  | "patient"

interface AuthContextType {
  user: AuthUser | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (requiredRole: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for hydration to avoid mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const signIn = async (email: string, password: string) => {
    // This is now handled by useLogin hook in the login page
    console.log('Use useLogin hook for sign in')
  }

  const signOut = async () => {
    await deinitFCM()
    clearSharedQueryClient()
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
    }
    logout()
  }

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false

    const roleHierarchy: Record<string, number> = {
      superadmin: 10,
      admin: 9,
      doctor: 8,
      dietitian: 7,
      physio: 6,
      finance: 5,
      pharmacy: 4,
      service_operations: 3,
      marketing: 2,
      sales: 1,
      nurse: 1,
      receptionist: 1,
      patient: 0,
    }

    const userRole = user.user_type as string
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status: !isHydrated ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated',
        signIn,
        signOut,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
