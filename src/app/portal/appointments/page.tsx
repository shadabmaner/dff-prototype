import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PortalAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Appointments</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Patient portal appointments scaffold.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            TODO: Implement appointment scheduler + list.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
