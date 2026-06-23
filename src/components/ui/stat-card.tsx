import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  } | any;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  trend,
  subtitle,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300`}></div>
      
      {/* Decorative Circle */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl transition-transform duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex flex-row justify-start gap-6 items-center mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-lg font-medium text-foreground">{title}</div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
