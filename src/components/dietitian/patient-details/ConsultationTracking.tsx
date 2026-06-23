"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

interface ConsultationTrackingProps {
  historyCalls: any[];
  upcomingAppointments: any[];
  completedCalls?:any
}

export function ConsultationTracking({
  historyCalls,
  upcomingAppointments,
  completedCalls
}: ConsultationTrackingProps) {
  const totalAppointments = (historyCalls?.length || 0) + (upcomingAppointments?.length || 0);
  console.log(completedCalls,"historyCalls")
  const historyCallLength=historyCalls?.length+completedCalls?.filter((item:any)=>item?.call_type==="history_call")?.length || 0
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            Consultation Tracking
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50/80 to-blue-100/50 rounded-lg border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {historyCallLength || 0}
            </p>
            <p className="text-sm font-medium text-blue-700 mt-0.5">
              History Calls
            </p>
            {historyCalls && historyCalls.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Last: {new Date(historyCalls[0].appointment_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 rounded-lg border border-emerald-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <p className="text-3xl font-bold text-emerald-900">
              {upcomingAppointments?.length || 0}
            </p>
            <p className="text-sm font-medium text-emerald-700 mt-0.5">
              Upcoming Consultations
            </p>
            {upcomingAppointments && upcomingAppointments.length > 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                Next: {new Date(upcomingAppointments[0].appointment_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-violet-50/80 to-violet-100/50 rounded-lg border border-violet-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <p className="text-3xl font-bold text-violet-900">
              {totalAppointments}
            </p>
            <p className="text-sm font-medium text-violet-700 mt-0.5">
              Total Appointments
            </p>
            <p className="text-xs text-violet-600 mt-1">All time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
