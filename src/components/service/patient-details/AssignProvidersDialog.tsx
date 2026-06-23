"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, AlertTriangle, User, Apple, HeartPulse, Phone, Mail } from "lucide-react";

interface AssignProvidersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: any;
  assignProvidersForm: {
    doctor_id: string;
    nutritionist_id: string;
    fitness_coach_id: string;
  };
  doctors: any[];
  nutritionists: any[];
  fitnessCoaches: any[];
  isLoadingDoctors: boolean;
  isLoadingNutritionists: boolean;
  isLoadingFitnessCoaches: boolean;
  isAssigningProviders: boolean;
  onDoctorChange: (value: string) => void;
  onNutritionistChange: (value: string) => void;
  onFitnessCoachChange: (value: string) => void;
  onSubmit: () => void;
}

export function AssignProvidersDialog({
  open,
  onOpenChange,
  enrollment,
  assignProvidersForm,
  doctors,
  nutritionists,
  fitnessCoaches,
  isLoadingDoctors,
  isLoadingNutritionists,
  isLoadingFitnessCoaches,
  isAssigningProviders,
  onDoctorChange,
  onNutritionistChange,
  onFitnessCoachChange,
  onSubmit,
}: AssignProvidersDialogProps) {
  const [showWarning, setShowWarning] = useState(false);

  // Check if any provider is being reassigned
  const hasReassignment = 
    (enrollment?.assigned_staff?.doctor?.id && assignProvidersForm.doctor_id !== enrollment.assigned_staff.doctor.id) ||
    (enrollment?.assigned_staff?.nutritionist?.id && assignProvidersForm.nutritionist_id !== enrollment.assigned_staff.nutritionist.id) ||
    (enrollment?.assigned_staff?.fitness_coach?.id && assignProvidersForm.fitness_coach_id !== enrollment.assigned_staff.fitness_coach.id);

  const handleSubmit = () => {
    if (hasReassignment) {
      setShowWarning(true);
    } else {
      onSubmit();
    }
  };

  const handleConfirmReassign = () => {
    setShowWarning(false);
    onSubmit();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Re-Assign Staff
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Select the doctor, nutritionist, and fitness coach for this patient.
            </DialogDescription>
          </DialogHeader>
        
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Current Assignments Summary */}
            {enrollment?.assigned_staff && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Current Assignments
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {enrollment.assigned_staff.doctor && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{enrollment.assigned_staff.doctor.name}</p>
                      <p className="text-xs text-slate-500">Doctor</p>
                    </div>
                  </div>
                )}
                {enrollment.assigned_staff.nutritionist && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Apple className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{enrollment.assigned_staff.nutritionist.name}</p>
                      <p className="text-xs text-slate-500">Nutritionist</p>
                    </div>
                  </div>
                )}
                {enrollment.assigned_staff.fitness_coach && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <HeartPulse className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{enrollment.assigned_staff.fitness_coach.name}</p>
                      <p className="text-xs text-slate-500">Fitness Coach</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-5 py-4">
            {/* Doctor */}
            <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
              <Label htmlFor="doctor" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-rose-600" />
                Doctor *
                {enrollment?.assigned_staff?.doctor && (
                  <Badge variant="outline" className="ml-2 border-rose-200 text-rose-700 bg-rose-50">
                    Current: {enrollment.assigned_staff.doctor.name}
                  </Badge>
                )}
              </Label>
              <Select
                value={assignProvidersForm.doctor_id}
                onValueChange={onDoctorChange}
                disabled={isLoadingDoctors}
              >
                <SelectTrigger id="doctor" className="bg-white">
                  <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                </SelectTrigger>
                <SelectContent>
                  {doctors && doctors.length > 0 ? (
                    doctors.map((doctor: any) => (
                      <SelectItem key={doctor.staff_id || doctor.id} value={doctor.staff_id || doctor.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{doctor.name || `${doctor.first_name} ${doctor.last_name}`.trim()}</span>
                          {doctor.phone && (
                            <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {doctor.phone}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-doctors" disabled>
                      No doctors available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Nutritionist */}
            <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
              <Label htmlFor="nutritionist" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Apple className="h-4 w-4 text-emerald-600" />
                Nutritionist *
                {enrollment?.assigned_staff?.nutritionist && (
                  <Badge variant="outline" className="ml-2 border-emerald-200 text-emerald-700 bg-emerald-50">
                    Current: {enrollment.assigned_staff.nutritionist.name}
                  </Badge>
                )}
              </Label>
              <Select
                value={assignProvidersForm.nutritionist_id}
                onValueChange={onNutritionistChange}
                disabled={isLoadingNutritionists}
              >
                <SelectTrigger id="nutritionist" className="bg-white">
                  <SelectValue placeholder={isLoadingNutritionists ? "Loading nutritionists..." : "Select a nutritionist"} />
                </SelectTrigger>
                <SelectContent>
                  {nutritionists && nutritionists.length > 0 ? (
                    nutritionists.map((nutritionist: any) => (
                      <SelectItem key={nutritionist.staff_id || nutritionist.id} value={nutritionist.staff_id || nutritionist.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{nutritionist.name || `${nutritionist.first_name} ${nutritionist.last_name}`.trim()}</span>
                          {nutritionist.phone && (
                            <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {nutritionist.phone}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-nutritionists" disabled>
                      No nutritionists available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Fitness Coach */}
            <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
              <Label htmlFor="fitness_coach" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-amber-600" />
                Fitness Coach *
                {enrollment?.assigned_staff?.fitness_coach && (
                  <Badge variant="outline" className="ml-2 border-amber-200 text-amber-700 bg-amber-50">
                    Current: {enrollment.assigned_staff.fitness_coach.name}
                  </Badge>
                )}
              </Label>
              <Select
                value={assignProvidersForm.fitness_coach_id}
                onValueChange={onFitnessCoachChange}
                disabled={isLoadingFitnessCoaches}
              >
                <SelectTrigger id="fitness_coach" className="bg-white">
                  <SelectValue placeholder={isLoadingFitnessCoaches ? "Loading fitness coaches..." : "Select a fitness coach"} />
                </SelectTrigger>
                <SelectContent>
                  {fitnessCoaches && fitnessCoaches.length > 0 ? (
                    fitnessCoaches.map((coach: any) => (
                      <SelectItem key={coach.staff_id || coach.id} value={coach.staff_id || coach.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{coach.name || `${coach.first_name} ${coach.last_name}`.trim()}</span>
                          {coach.phone && (
                            <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {coach.phone}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-coaches" disabled>
                      No fitness coaches available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={isAssigningProviders}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
              disabled={isAssigningProviders}
            >
              {isAssigningProviders ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Assign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassignment Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Provider Reassignment
            </DialogTitle>
          </DialogHeader>
          <Alert className="border-amber-200 bg-amber-50 mt-4">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You are about to reassign one or more providers. This action will:
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Remove the current provider from this patient</li>
              <li>Assign the new provider to this patient</li>
              <li>The previous provider will no longer have access to this patient's data</li>
              <li>All appointment history will be preserved</li>
            </ul>
          </div>
          <DialogFooter className="gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowWarning(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReassign}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Confirm Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
