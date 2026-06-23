import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DietitianAssignedPatientsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Assigned Patients</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Dietitian view of assigned patients.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patients Table</CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-gray-500 mt-0.5">
          TODO: Columns: Patient, Program, Last Plan, Compliance %, Next Review, Actions
        </CardContent>
      </Card>
    </div>
  )
}
