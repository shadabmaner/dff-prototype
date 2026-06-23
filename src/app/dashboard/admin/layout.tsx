import { AdminProvider } from "@/components/admin/admin-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>
}
