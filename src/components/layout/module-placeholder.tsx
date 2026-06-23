import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export function ModulePlaceholder({
  department,
  module,
}: {
  department: string
  module: string
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          {department} / {module}
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          This module is part of the SOW and will be implemented next.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100 mb-4">
            <Construction className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900">Coming Soon</h3>
          <p className="mt-1 text-[13px] text-gray-400 max-w-sm text-center">
            This module is currently under development and will be available shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
