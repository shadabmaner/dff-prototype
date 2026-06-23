"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

interface GoalSettingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  goalForm: {
    weight_kg: string;
    chest_cm: string;
    waist_cm: string;
    hips_cm: string;
    arm_cm: string;
    calf_cm: string;
    muscle_mass_percentage: string;
  };
  goalFormErrors: {
    weight_kg: string;
    chest_cm: string;
    waist_cm: string;
    hips_cm: string;
    arm_cm: string;
    calf_cm: string;
    muscle_mass_percentage: string;
  };
  onGoalFormChange: (field: string, value: string) => void;
  onGoalFormErrorClear: (field: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function GoalSettingDrawer({
  open,
  onOpenChange,
  patientName,
  goalForm,
  goalFormErrors,
  onGoalFormChange,
  onGoalFormErrorClear,
  onSave,
  onCancel,
  isLoading,
}: GoalSettingDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-900">Set Body Measurement Goals</SheetTitle>
          <SheetDescription className="text-slate-600">
            Set weight and body measurement goals for {patientName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight_kg" className="text-sm font-medium text-slate-700">
              Weight (kg)
            </Label>
            <Input
              id="weight_kg"
              type="text"
              placeholder="Enter target weight in kg"
              value={goalForm.weight_kg}
              onChange={(e) => {
                onGoalFormChange("weight_kg", e.target.value);
                if (goalFormErrors.weight_kg) {
                  onGoalFormErrorClear("weight_kg");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.weight_kg ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.weight_kg && (
              <p className="text-sm text-red-600">{goalFormErrors.weight_kg}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chest_cm" className="text-sm font-medium text-slate-700">
              Chest (cm)
            </Label>
            <Input
              id="chest_cm"
              type="text"
              placeholder="Enter target chest measurement in cm"
              value={goalForm.chest_cm}
              onChange={(e) => {
                onGoalFormChange("chest_cm", e.target.value);
                if (goalFormErrors.chest_cm) {
                  onGoalFormErrorClear("chest_cm");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.chest_cm ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.chest_cm && (
              <p className="text-sm text-red-600">{goalFormErrors.chest_cm}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="waist_cm" className="text-sm font-medium text-slate-700">
              Waist (cm)
            </Label>
            <Input
              id="waist_cm"
              type="text"
              placeholder="Enter target waist measurement in cm"
              value={goalForm.waist_cm}
              onChange={(e) => {
                onGoalFormChange("waist_cm", e.target.value);
                if (goalFormErrors.waist_cm) {
                  onGoalFormErrorClear("waist_cm");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.waist_cm ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.waist_cm && (
              <p className="text-sm text-red-600">{goalFormErrors.waist_cm}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hips_cm" className="text-sm font-medium text-slate-700">
              Hips (cm)
            </Label>
            <Input
              id="hips_cm"
              type="text"
              placeholder="Enter target hips measurement in cm"
              value={goalForm.hips_cm}
              onChange={(e) => {
                onGoalFormChange("hips_cm", e.target.value);
                if (goalFormErrors.hips_cm) {
                  onGoalFormErrorClear("hips_cm");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.hips_cm ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.hips_cm && (
              <p className="text-sm text-red-600">{goalFormErrors.hips_cm}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="arm_cm" className="text-sm font-medium text-slate-700">
              Arm (cm)
            </Label>
            <Input
              id="arm_cm"
              type="text"
              placeholder="Enter target arm measurement in cm"
              value={goalForm.arm_cm}
              onChange={(e) => {
                onGoalFormChange("arm_cm", e.target.value);
                if (goalFormErrors.arm_cm) {
                  onGoalFormErrorClear("arm_cm");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.arm_cm ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.arm_cm && (
              <p className="text-sm text-red-600">{goalFormErrors.arm_cm}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="calf_cm" className="text-sm font-medium text-slate-700">
              Calf (cm)
            </Label>
            <Input
              id="calf_cm"
              type="text"
              placeholder="Enter target calf measurement in cm"
              value={goalForm.calf_cm}
              onChange={(e) => {
                onGoalFormChange("calf_cm", e.target.value);
                if (goalFormErrors.calf_cm) {
                  onGoalFormErrorClear("calf_cm");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.calf_cm ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.calf_cm && (
              <p className="text-sm text-red-600">{goalFormErrors.calf_cm}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="muscle_mass_percentage" className="text-sm font-medium text-slate-700">
              Muscle Mass (%)
            </Label>
            <Input
              id="muscle_mass_percentage"
              type="text"
              placeholder="Enter target muscle mass percentage"
              value={goalForm.muscle_mass_percentage}
              onChange={(e) => {
                onGoalFormChange("muscle_mass_percentage", e.target.value);
                if (goalFormErrors.muscle_mass_percentage) {
                  onGoalFormErrorClear("muscle_mass_percentage");
                }
              }}
              className={`border-slate-300 ${goalFormErrors.muscle_mass_percentage ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {goalFormErrors.muscle_mass_percentage && (
              <p className="text-sm text-red-600">{goalFormErrors.muscle_mass_percentage}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              {isLoading ? (
                <>
                  <Target className="h-4 w-4 mr-2 animate-spin" />
                  Setting Goals...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Set Goals
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
