import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  colorScheme?: "blue" | "emerald" | "amber" | "rose" | "purple" | "indigo"
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  colorScheme = "blue" 
}: StatsCardProps) {
  const colors = {
    blue: {
      bg: "from-blue-50 to-indigo-50",
      text: "text-blue-700",
      icon: "from-blue-500 to-indigo-500",
      badge: "text-blue-600"
    },
    emerald: {
      bg: "from-emerald-50 to-teal-50",
      text: "text-emerald-700",
      icon: "from-emerald-500 to-teal-500",
      badge: "text-emerald-600"
    },
    amber: {
      bg: "from-amber-50 to-orange-50",
      text: "text-amber-700",
      icon: "from-amber-500 to-orange-500",
      badge: "text-amber-600"
    },
    rose: {
      bg: "from-rose-50 to-pink-50",
      text: "text-rose-700",
      icon: "from-rose-500 to-pink-500",
      badge: "text-rose-600"
    },
    purple: {
      bg: "from-purple-50 to-violet-50",
      text: "text-purple-700",
      icon: "from-purple-500 to-violet-500",
      badge: "text-purple-600"
    },
    indigo: {
      bg: "from-indigo-50 to-blue-50",
      text: "text-indigo-700",
      icon: "from-indigo-500 to-blue-500",
      badge: "text-indigo-600"
    }
  }

  const scheme = colors[colorScheme]

  return (
    <Card className={cn("border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group bg-gradient-to-br", scheme.bg)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("h-3 w-3", scheme.badge)} />
              <p className={cn("text-[10px] uppercase tracking-[0.15em] font-semibold", scheme.text)}>
                {title}
              </p>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
            {subtitle && (
              <p className={cn("text-xs font-medium", scheme.text + "/80")}>{subtitle}</p>
            )}
            {trend && (
              <p className={cn("text-xs font-semibold mt-2", trend.positive ? "text-emerald-600" : "text-rose-600")}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
            scheme.icon
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
