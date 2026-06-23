"use client"

import { usePharmacy } from "@/components/pharmacy/pharmacy-context"
import { PrescriptionsTable } from "@/components/pharmacy/prescriptions-table"

function Content() {
  const { prescriptions } = usePharmacy()
  const data = prescriptions.filter((p) => p.status === "PROCESSING")

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Processing</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          View doctor orders, generate bills, manage dispatch, and track refills.
        </p>
      </div>

      <PrescriptionsTable data={data} />
    </div>
  )
}

export default function PharmacyProcessingPage() {
  return <Content />
}
