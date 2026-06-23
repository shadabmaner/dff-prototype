"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Activity,
    Apple,
    Dumbbell,
    Syringe,
    Baby,
    Flame,
    Scale
} from "lucide-react"

interface ProgramBadgeProps {
    program: string
    size?: "sm" | "md" | "lg"
    className?: string
}

export function ProgramBadge({ program, size = "md", className }: ProgramBadgeProps) {
    const getProgramConfig = (p: string) => {
        const normalized = p.toLowerCase()
        if (normalized.includes("diabetes")) return { label: "Diabetes", icon: Syringe, color: "bg-blue-50 text-blue-700 border-blue-100" }
        if (normalized.includes("weight") || normalized.includes("obesity")) return { label: "Weight Loss", icon: Scale, color: "bg-indigo-50 text-indigo-700 border-indigo-100" }
        if (normalized.includes("thyroid")) return { label: "Thyroid", icon: Activity, color: "bg-amber-50 text-amber-700 border-amber-100" }
        if (normalized.includes("heart") || normalized.includes("cardio")) return { label: "Cardiac", icon: Activity, color: "bg-rose-50 text-rose-700 border-rose-100" }
        if (normalized.includes("fitness") || normalized.includes("workout")) return { label: "Fitness", icon: Dumbbell, color: "bg-emerald-50 text-emerald-700 border-emerald-100" }
        if (normalized.includes("pcos")) return { label: "PCOS", icon: Baby, color: "bg-purple-50 text-purple-700 border-purple-100" }
        return { label: p, icon: Activity, color: "bg-slate-50 text-slate-700 border-slate-100" }
    }

    const config = getProgramConfig(program)
    const Icon = config.icon

    return (
        <Badge
            variant="outline"
            className={cn(
                "rounded-full font-black uppercase tracking-widest border-none gap-2 px-3",
                size === "sm" ? "text-[8px] py-0.5" : size === "lg" ? "text-[11px] py-1.5 px-5" : "text-[9px] py-1",
                config.color,
                className
            )}
        >
            <Icon className={cn(size === "sm" ? "w-2.5 h-2.5" : size === "lg" ? "w-4 h-4" : "w-3 h-3")} />
            {config.label}
        </Badge>
    )
}
