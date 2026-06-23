"use client"

import { SalesProvider } from "@/components/sales/sales-context"

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <SalesProvider>{children}</SalesProvider>
}
