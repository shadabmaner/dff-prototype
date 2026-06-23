"use client"

import { usePharmacy } from "@/components/pharmacy/pharmacy-context"
import { PrescriptionsTable } from "@/components/pharmacy/prescriptions-table"

function Content() {
  const { prescriptions } = usePharmacy()
  const data = prescriptions.filter(
    (p) => p.status === "READY" || p.status === "DISPATCHED"
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Dispatch</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Dispatch medicines and track deliveries.
        </p>
      </div>

      <PrescriptionsTable data={data} />
    </div>
  )
}

export default function PharmacyDispatchPage() {
  return <Content />
}
