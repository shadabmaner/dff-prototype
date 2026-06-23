import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Patient Portal</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Patient-facing dashboard scaffold.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              View and schedule appointments.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              View prescriptions and refills.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
