"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

interface ConsultationTrackingProps {
  historyCallFormCount: number;
  upcomingAppointments: any[];
  patientClinicalData: any;
}

export function ConsultationTracking({ historyCallFormCount, upcomingAppointments, patientClinicalData }: ConsultationTrackingProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Consultation Tracking</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-0 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{historyCallFormCount || 0}</p>
            <p className="text-sm font-medium text-blue-700 mt-1">History Calls</p>
            {patientClinicalData?.data?.history_calls && patientClinicalData.data.history_calls.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                Last: {new Date(patientClinicalData.data.history_calls[0].appointment_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-0 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-emerald-900">{upcomingAppointments?.length || 0}</p>
            <p className="text-sm font-medium text-emerald-700 mt-1">Upcoming Consultations</p>
            {upcomingAppointments && upcomingAppointments.length > 0 && (
              <p className="text-xs text-emerald-600 mt-2">
                Next: {new Date(upcomingAppointments[0].appointment_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border-0 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-violet-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-violet-900">
              {(patientClinicalData?.data?.history_calls?.length || 0) + (upcomingAppointments?.length || 0)}
            </p>
            <p className="text-sm font-medium text-violet-700 mt-1">Total Appointments</p>
            <p className="text-xs text-violet-600 mt-2">All time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
