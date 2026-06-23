"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Apple, HeartPulse, Phone } from "lucide-react";

interface CareTeamSectionProps {
  enrollment: any;
}

export function CareTeamSection({ enrollment }: CareTeamSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border border-slate-200/50 bg-slate-50/50 shadow-sm hover:shadow-lg hover:border-indigo-200/70 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center hover:from-indigo-200 hover:to-indigo-300 transition-colors">
              <Stethoscope className="h-5 w-5 text-indigo-700" />
            </div>
            <h3 className="text-sm font-semibold text-indigo-900">Assigned Doctor</h3>
          </div>
          {enrollment?.assigned_staff?.doctor ? (
            <div className="space-y-1">
              <p className="font-medium text-indigo-900 hover:text-indigo-800 transition-colors">
                {enrollment.assigned_staff.doctor.name}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {enrollment.assigned_staff.doctor.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not assigned</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200/50 bg-slate-50/50 shadow-sm hover:shadow-lg hover:border-emerald-200/70 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center hover:from-emerald-200 hover:to-emerald-300 transition-colors">
              <Apple className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="text-sm font-semibold text-indigo-900">
              Assigned Nutritionist
            </h3>
          </div>
          {enrollment?.assigned_staff?.nutritionist ? (
            <div className="space-y-1">
              <p className="font-medium text-indigo-900 hover:text-indigo-800 transition-colors">
                {enrollment.assigned_staff.nutritionist.name}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {enrollment.assigned_staff.nutritionist.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not assigned</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200/50 bg-slate-50/50 shadow-sm hover:shadow-lg hover:border-orange-200/70 hover:bg-orange-50/30 transition-all duration-300 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center hover:from-orange-200 hover:to-orange-300 transition-colors">
              <HeartPulse className="h-5 w-5 text-orange-700" />
            </div>
            <h3 className="text-sm font-semibold text-indigo-900">
              Assigned Fitness Coach
            </h3>
          </div>
          {enrollment?.assigned_staff?.fitness_coach ? (
            <div className="space-y-1">
              <p className="font-medium text-indigo-900 hover:text-indigo-800 transition-colors">
                {enrollment.assigned_staff.fitness_coach.name}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {enrollment.assigned_staff.fitness_coach.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not assigned</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
