"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Target, Calendar, Activity } from "lucide-react";
import { BodyMeasurement } from "@/lib/api/patient-client";

interface BodyMeasurementsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  bodyMeasurementGoals: any[];
  latestBodyMeasurements?: BodyMeasurement | null;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  weight_loss: "Weight Loss",
  chest_cm: "Chest",
  waist_cm: "Waist",
  hips_cm: "Hips",
  arm_cm: "Arm",
  calf_cm: "Calf",
  thighs_cm: "Thighs",
  muscle_mass: "Muscle Mass",
};

const GOAL_TO_MEASUREMENT_FIELD: Record<string, string> = {
  chest_cm: "chest_cm",
  waist_cm: "waist_cm",
  hips_cm: "hips_cm",
  arm_cm: "arm_cm",
  thighs_cm: "thighs_cm",
  calf_cm: "calf_cm",
  muscle_mass: "muscle_mass_percentage",
};

export function BodyMeasurementsDrawer({
  open,
  onOpenChange,
  patientName,
  bodyMeasurementGoals,
  latestBodyMeasurements,
}: BodyMeasurementsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900">Body Measurements</SheetTitle>
          <SheetDescription className="text-slate-600">
            View body measurement goals for {patientName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Latest Actual Measurements Card */}
          {latestBodyMeasurements && (
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Latest Actual Measurements</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {[
                  { label: "Chest", value: latestBodyMeasurements.chest_cm, unit: "cm" },
                  { label: "Waist", value: latestBodyMeasurements.waist_cm, unit: "cm" },
                  { label: "Hips", value: latestBodyMeasurements.hips_cm, unit: "cm" },
                  { label: "Arm", value: latestBodyMeasurements.arm_cm, unit: "cm" },
                  { label: "Thighs", value: latestBodyMeasurements.thighs_cm, unit: "cm" },
                  { label: "Calf", value: latestBodyMeasurements.calf_cm, unit: "cm" },
                  { label: "Body Fat", value: latestBodyMeasurements.body_fat_percentage, unit: "%" },
                  { label: "Muscle Mass", value: latestBodyMeasurements.muscle_mass_percentage, unit: "%" },
                ].map((m, i) => m.value !== null && m.value !== undefined && (
                  <div key={i} className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{m.label}</span>
                    <span className="text-xl font-bold text-white tracking-tight">
                      {m.value} <span className="text-xs font-medium text-slate-500">{m.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <Calendar className="h-3 w-3" />
                Logged on: {new Date(latestBodyMeasurements.logged_date).toLocaleDateString()}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1">Measurement Goals</h3>
            {bodyMeasurementGoals && bodyMeasurementGoals.length > 0 ? (
              bodyMeasurementGoals.map((goal) => {
                const measurementField = GOAL_TO_MEASUREMENT_FIELD[goal.goal_type];
                const actualValue = latestBodyMeasurements && measurementField ? (latestBodyMeasurements as any)[measurementField] : null;
                
                return (
                  <div
                    key={goal.id}
                    className="p-4 border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-semibold text-slate-900">
                          {GOAL_TYPE_LABELS[goal.goal_type] || goal.goal_type}
                        </h3>
                      </div>
                      <Badge
                        className={
                          goal.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : goal.status === "completed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                        }
                      >
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                          <Target className="h-3 w-3" />
                          Target
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {goal.target_value} <span className="text-xs font-medium text-slate-500">{goal.unit}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-1">
                          <Activity className="h-3 w-3" />
                          Actual
                        </div>
                        <div className="text-lg font-bold text-emerald-900">
                          {actualValue !== null && actualValue !== undefined
                            ? `${actualValue} ${goal.unit}`
                            : goal.current_value !== null && goal.current_value !== undefined
                              ? `${goal.current_value} ${goal.unit}`
                              : "N/A"}
                        </div>
                      </div>
                    </div>

                    {goal.target_date && (
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        Target Date: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}

                    {goal.notes && (
                      <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600 border border-slate-100">
                        {goal.notes}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Ruler className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No measurement goals set</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 mt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
