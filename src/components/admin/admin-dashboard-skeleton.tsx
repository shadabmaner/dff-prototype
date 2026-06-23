import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-96 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patient Growth & Age Distribution Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] bg-slate-100 rounded-xl animate-pulse" />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[220px] bg-slate-100 rounded-xl animate-pulse" />
            <div className="space-y-2 mt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Distribution & Gender Distribution Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[260px] bg-slate-100 rounded-xl animate-pulse" />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Knowledge Base Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Utilization Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Activity Skeleton */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
