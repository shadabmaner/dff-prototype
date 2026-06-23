"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Apple } from "lucide-react";

interface DietPlanProgressCardProps {
  activeDietPlan: any;
  getProgramDay: (startDate: any) => string;
}

export function DietPlanProgressCard({
  activeDietPlan,
  getProgramDay,
}: DietPlanProgressCardProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Apple className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Diet Plan Progress
          </h2>
        </div>
        {activeDietPlan ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Plan Duration
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">
                    {getProgramDay(activeDietPlan.journey_start_date)}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {activeDietPlan.total_days
                      ? `of ${activeDietPlan.total_days} days`
                      : "Ongoing"}
                  </span>
                </div>
              </div>
              <Progress
                value={activeDietPlan.progress_percent ?? 0}
                className="h-3"
              />
              <p className="text-xs text-slate-600 mt-1">
                {(activeDietPlan.progress_percent ?? 0).toFixed(0)}% Complete
              </p>
            </div>

            
            {activeDietPlan.summary ? (
              <div className="p-4 border border-slate-200 rounded-lg bg-emerald-50">
                <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">
                  Plan Summary
                </p>
                <p className="text-sm text-slate-700">
                  {activeDietPlan.summary}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-center py-12">
            <Apple className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">
              Diet plan not assigned yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Once a plan is created for this patient, progress will appear
              here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
