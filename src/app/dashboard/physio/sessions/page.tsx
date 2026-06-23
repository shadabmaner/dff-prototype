import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PhysioSessionsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Sessions</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Physiotherapy sessions scheduling and completion tracking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions Table</CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-gray-500 mt-0.5">TODO</CardContent>
      </Card>
    </div>
  )
}
