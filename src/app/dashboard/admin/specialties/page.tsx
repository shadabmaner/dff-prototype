"use client"

import ManageMedicalSpecialitiesPage from "@/app/dashboard/super-admin/specialities/page"
import { SuperAdminProvider } from "@/components/super-admin/super-admin-context"

export default function AdminSpecialtiesPage() {
  return (
    <SuperAdminProvider>
      <ManageMedicalSpecialitiesPage />
    </SuperAdminProvider>
  )
}
