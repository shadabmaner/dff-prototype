import { SuperAdminProvider } from "@/components/super-admin/super-admin-context"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminProvider>{children}</SuperAdminProvider>
}
