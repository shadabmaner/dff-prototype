"use client"

import { usePharmacy } from "@/components/pharmacy/pharmacy-context"
import { PrescriptionsTable } from "@/components/pharmacy/prescriptions-table"

function Content() {
  const { prescriptions } = usePharmacy()
  const data = prescriptions.filter((p) => p.status === "NEW")

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">New Prescriptions</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Incoming prescriptions from doctors.
        </p>
      </div>

      <PrescriptionsTable data={data} />
    </div>
  )
}

export default function PharmacyNewPrescriptionsPage() {
  return <Content />
}
