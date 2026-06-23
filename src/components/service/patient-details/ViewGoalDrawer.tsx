"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

interface ViewGoalDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  bodyMeasurementGoals: any[];
}

export function ViewGoalDrawer({ open, onOpenChange, patient, bodyMeasurementGoals }: ViewGoalDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Body Measurement Goals
          </SheetTitle>
          <SheetDescription className="text-slate-600">
            Assigned goals and targets for {patient?.first_name} {patient?.last_name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {bodyMeasurementGoals.length > 0 ? (
            <div className="grid gap-4">
              {bodyMeasurementGoals.map((goal: any) => (
                <Card key={goal.id} className="border border-slate-200 bg-slate-50/50 shadow-none hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        {goal.goal_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {goal.target_value}
                        <span className="text-sm font-medium text-slate-500 ml-1">
                          {goal.unit}
                        </span>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        Target Date
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        {new Date(goal.target_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No assigned goals found</p>
            </div>
          )}

          <div className="pt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full border-slate-300 hover:bg-slate-50 h-11 font-semibold"
            >
              Close View
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
