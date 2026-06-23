import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PhysioExercisePlansPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Exercise Plans</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Create and manage exercise plans.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Plan Form</CardTitle>
        </CardHeader>
        <CardContent className="text-[13px] text-gray-500 mt-0.5">
          TODO: Fields: Exercise Type, Frequency, Duration, Intensity, Video Link, Notes
        </CardContent>
      </Card>
    </div>
  )
}
