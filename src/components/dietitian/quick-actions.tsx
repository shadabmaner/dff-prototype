import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Utensils, Calendar } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid gap-3">
        <Link href="/dashboard/dietitian/availability">
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Clock className="mr-2 h-4 w-4" />
            Add Availability
          </Button>
        </Link>
        <Link href="/dashboard/dietitian/diet-plans">
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Utensils className="mr-2 h-4 w-4" />
            Create Diet Plan
          </Button>
        </Link>
        <Link href="/dashboard/dietitian/appointments">
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Calendar className="mr-2 h-4 w-4" />
            View Today's Appointments
          </Button>
        </Link>
      </div>
    </Card>
  )
}
