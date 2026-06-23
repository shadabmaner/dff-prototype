"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Apple, HeartPulse, Phone, Edit } from "lucide-react";

interface AssignedStaffSectionProps {
  enrollment: any;
  onOpenAssignProvidersDialog: () => void;
}

export function AssignedStaffSection({ enrollment, onOpenAssignProvidersDialog }: AssignedStaffSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Assigned Staff</h2>
        <Button
          onClick={onOpenAssignProvidersDialog}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        >
          <Edit className="h-4 w-4 mr-2" />
          ReAssign Staff
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Doctor</h3>
            </div>
            {enrollment?.assigned_staff?.doctor ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  {enrollment.assigned_staff.doctor.name}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {enrollment.assigned_staff.doctor.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not assigned</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Apple className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Nutritionist</h3>
            </div>
            {enrollment?.assigned_staff?.nutritionist ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  {enrollment.assigned_staff.nutritionist.name}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {enrollment.assigned_staff.nutritionist.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not assigned</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <HeartPulse className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Fitness Coach</h3>
            </div>
            {enrollment?.assigned_staff?.fitness_coach ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  {enrollment.assigned_staff.fitness_coach.name}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {enrollment.assigned_staff.fitness_coach.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
