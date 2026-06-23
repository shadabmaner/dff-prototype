"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  Target,
  Calendar,
  Plus,
  FileText,
  ClipboardList,
  RotateCcw,
  Ruler,
} from "lucide-react";

interface PatientHeaderProps {
  patient: any;
  enrollment: any;
  patientAge: number | null;
  metricsData: any;
  bodyMeasurementGoals: any[];
  activeDietPlan: any;
  upcomingHistoryCall: any;
  patientId: string;
  onSetGoal: () => void;
  onViewGoal: () => void;
  onBodyMeasurements: () => void;
  onStartDietPlan: () => void;
  onSelectDietPlan: () => void;
  onViewGuidelines: () => void;
  onViewAssessment: () => void;
  onScheduleCall?: () => void;
  isStartingDietPlan?: boolean;
}

export function PatientHeader({
  patient,
  enrollment,
  patientAge,
  metricsData,
  bodyMeasurementGoals,
  activeDietPlan,
  upcomingHistoryCall,
  patientId,
  onSetGoal,
  onViewGoal,
  onBodyMeasurements,
  onStartDietPlan,
  onSelectDietPlan,
  onViewGuidelines,
  onViewAssessment,
  onScheduleCall,
  isStartingDietPlan = false,
}: PatientHeaderProps) {
  return (
    <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-950 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {patient?.first_name?.[0]}
              {patient?.last_name?.[0]}
            </div>
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  {patient?.first_name} {patient?.last_name}
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {patient?.phone || "N/A"}
                </div>
                {patient?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </div>
                )}
                {patient?.city && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">📍</span>
                    {patient.city}, {patient.country}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {enrollment && (
                  <Badge
                    className={`${
                      enrollment.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : enrollment.status === "completed"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {enrollment.status.charAt(0).toUpperCase() +
                      enrollment.status.slice(1)}
                  </Badge>
                )}
                {metricsData?.data?.weight_logs &&
                  metricsData.data.weight_logs?.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-slate-300 text-slate-700"
                    >
                      Weight: {metricsData.data.weight_logs[0].weight_kg} kg
                    </Badge>
                  )}
                {patientAge && (
                  <Badge
                    variant="outline"
                    className="border-slate-300 text-slate-700"
                  >
                    Age: {patientAge} years
                  </Badge>
                )}
                {patient?.gender && (
                  <Badge
                    variant="outline"
                    className="border-slate-300 text-slate-700 capitalize"
                  >
                    {patient.gender}
                  </Badge>
                )}
                {activeDietPlan?.journey_start_date && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700"
                  >
                    Started: {new Date(activeDietPlan.journey_start_date).toLocaleDateString()}
                  </Badge>
                )}
                {activeDietPlan?.journey_end_date && (
                  <Badge
                    variant="outline"
                    className="border-emerald-200 text-emerald-700"
                  >
                    Ends: {new Date(activeDietPlan.journey_end_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onBodyMeasurements}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
            >
              <Ruler className="h-4 w-4 mr-2" />
              Body Measurements
            </Button>

            {bodyMeasurementGoals?.length > 0 ? (
              <Button
                onClick={onViewGoal}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
              >
                <Target className="h-4 w-4 mr-2" />
                Assigned Goals
              </Button>
            ) : (
              <Button
                onClick={onSetGoal}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
              >
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            )}

            {activeDietPlan ? (
              <Button
                className={`bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white shadow-lg ${isStartingDietPlan || !!activeDietPlan?.journey_start_date ? 'cursor-not-allowed' : ''}`}
                onClick={isStartingDietPlan || !!activeDietPlan?.journey_start_date ? undefined : onStartDietPlan}
                // disabled={isStartingDietPlan || !!activeDietPlan?.journey_start_date}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {!!activeDietPlan?.journey_start_date
                  ? "Diet Plan Initiated"
                  : isStartingDietPlan
                    ? "Starting..."
                    : "Start Diet Plan"}
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                onClick={onSelectDietPlan}
              >
                <Plus className="h-4 w-4 mr-1" />
                Select Diet Plan Template
              </Button>
            )}

            {activeDietPlan && (
              <Button
                onClick={onViewGuidelines}
                className="bg-sky-800 hover:bg-sky-900 text-white shadow-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Guidelines Pdfs
              </Button>
            )}

            <Button
              onClick={onViewAssessment}
              className="bg-gradient-to-r from-indigo-800 to-sky-800 hover:from-sky-900 hover:to-sky-900 text-white shadow-lg"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              View Assessment
            </Button>

            {!upcomingHistoryCall && (
              <Button
                variant="outline"
                onClick={onScheduleCall}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Schedule Next Call
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
