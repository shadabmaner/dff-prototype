"use client"

import { PharmacyProvider } from "@/components/pharmacy/pharmacy-context"

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PharmacyProvider>{children}</PharmacyProvider>
}
