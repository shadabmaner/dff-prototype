"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Activity, CheckCircle2 } from "lucide-react";

interface AppointmentsTimelineProps {
  missingAppointments: any[];
  currentAppointments: any[];
  upcomingAppointments: any[];
  completedAppointments: any[];
  renderAppointmentCard: (appointment: any) => React.ReactNode;
}

export function AppointmentsTimeline({
  missingAppointments,
  currentAppointments,
  upcomingAppointments,
  completedAppointments,
  renderAppointmentCard,
}: AppointmentsTimelineProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-sky-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Appointments & Consultations</h2>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100/50 p-1 h-12 rounded-xl">
            <TabsTrigger
              value="missing"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Missing {missingAppointments.length > 0 &&
                <Badge className="ml-2 bg-red-100 text-red-600 border-none px-1.5 h-4 min-w-[16px] flex items-center justify-center text-[10px]">
                  {missingAppointments.length}
                </Badge>
              }
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Upcoming {(currentAppointments.length + upcomingAppointments.length) > 0 &&
                <Badge className="ml-2 bg-sky-100 text-sky-600 border-none px-1.5 h-4 min-w-[16px] flex items-center justify-center text-[10px]">
                  {currentAppointments.length + upcomingAppointments.length}
                </Badge>
              }
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all font-semibold"
            >
              Completed {completedAppointments.length > 0 &&
                <Badge className="ml-2 bg-emerald-100 text-emerald-600 border-none px-1.5 h-4 min-w-[16px] flex items-center justify-center text-[10px]">
                  {completedAppointments.length}
                </Badge>
              }
            </TabsTrigger>
          </TabsList>

          <TabsContent value="missing" className="space-y-4 outline-none">
            {missingAppointments.length > 0 ? (
              <div className="space-y-6">
                {missingAppointments.map((appointment: any) => renderAppointmentCard(appointment))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium font-outfit">No missing appointments found</p>
                <p className="text-sm text-slate-500 mt-1">Excellent job keeping up with the schedule!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {[...currentAppointments, ...upcomingAppointments].length > 0 ? (
              <div className="space-y-6">
                {[...currentAppointments, ...upcomingAppointments].map((appointment: any) => renderAppointmentCard(appointment))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium font-outfit">No upcoming consultations</p>
                <p className="text-sm text-slate-500 mt-1">New scheduled sessions will show up here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 outline-none">
            {completedAppointments.length > 0 ? (
              <div className="space-y-6">
                {completedAppointments.map((appointment: any) => renderAppointmentCard(appointment))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium font-outfit">No completed appointments yet</p>
                <p className="text-sm text-slate-500 mt-1">Past sessions will be archived here for reference.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
