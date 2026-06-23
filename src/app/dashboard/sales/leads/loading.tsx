import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 rounded-lg" />
            ))}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-slate-50/60 px-4 py-3 sm:grid sm:grid-cols-6"
              >
                <Skeleton className="h-4 w-full sm:col-span-2" />
                <Skeleton className="h-4 w-full sm:col-span-1" />
                <Skeleton className="h-4 w-full sm:col-span-1" />
                <Skeleton className="h-4 w-full sm:col-span-1" />
                <Skeleton className="h-4 w-full sm:col-span-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
