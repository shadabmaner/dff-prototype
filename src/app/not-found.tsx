"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

// Map user_type to dashboard path
const getDashboardPath = (userType: string): string => {
  const pathMap: Record<string, string> = {
    sales: "/dashboard/sales/dashboard",
    marketing: "/dashboard/marketing/dashboard",
    doctor: "/dashboard/doctor/dashboard",
    dietitian: "/dashboard/dietitian/dashboard",
    physio: "/dashboard/physio/dashboard",
    pharmacist: "/dashboard/pharmacy/dashboard",
    fitness_coach: "/dashboard/fitness-coach/dashboard",
    finance: "/dashboard/finance/dashboard",
    service_operations: "/dashboard/service/dashboard",
    tele_caller: "/dashboard/telecaller",
    admin: "/dashboard/admin/dashboard",
    superadmin: "/dashboard/super-admin/dashboard",
  };
  return pathMap[userType] || "/dashboard";
};

export default function NotFound() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.user_type) {
      // Fallback to role-specific dashboard
      router.replace(getDashboardPath(user.user_type));
    } else {
      // Fallback to login
      router.replace("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  return null;
}
