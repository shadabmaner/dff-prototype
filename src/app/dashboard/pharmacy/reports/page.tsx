import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PharmacyReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Pharmacy KPIs, dispatch SLAs, billing summaries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-gray-500 mt-0.5">TODO</CardContent>
      </Card>
    </div>
  )
}
