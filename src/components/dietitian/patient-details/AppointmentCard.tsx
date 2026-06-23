"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Activity, Video, PhoneCall, RotateCcw, User } from "lucide-react";

interface AppointmentCardProps {
  appointment: any;
  onReschedule: (appointment: any) => void;
  onClick: (appointment: any) => void;
}

export function AppointmentCard({
  appointment,
  onReschedule,
  onClick,
}: AppointmentCardProps) {
  const isHistoryCall = appointment.call_type === "history_call";
  const Icon = appointment.mode === "video" ? Video : PhoneCall;

  return (
    <div className="relative flex items-start gap-4">
      <div
        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
          appointment.status === "completed"
            ? "bg-blue-100 border-2 border-blue-300"
            : appointment.status === "confirmed"
              ? "bg-emerald-100 border-2 border-emerald-300"
              : appointment.status === "pending"
                ? "bg-amber-100 border-2 border-amber-300"
                : "bg-slate-100 border-2 border-slate-300"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            appointment.status === "completed"
              ? "text-blue-600"
              : appointment.status === "confirmed"
                ? "text-emerald-600"
                : appointment.status === "pending"
                  ? "text-amber-600"
                  : "text-slate-600"
          }`}
        />
      </div>
      <div className="flex-1 pb-6">
        <div
          className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
          onClick={() => onClick(appointment)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-900 text-base">
                  {appointment.appointment_type?.charAt(0).toUpperCase() +
                    appointment.appointment_type?.slice(1) || "Appointment"}
                </h4>
                {isHistoryCall && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                  >
                    History Call
                  </Badge>
                )}
              </div>
              {appointment.staff_name && (
                <div className="flex justify-end gap-1 text-sm text-slate-600 mt-1">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium">{appointment.staff_name}</span>
                  {appointment.staff_type && (
                    <span className="text-slate-500">({appointment.staff_type})</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${
                    appointment.status === "completed"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : appointment.status === "confirmed"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : appointment.status === "pending"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : appointment.status === "cancelled"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {appointment.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-slate-300 text-slate-700 capitalize"
                >
                  {appointment.mode}
                </Badge>
                {appointment.call_type && (
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-300 text-slate-700 capitalize"
                  >
                    {appointment.call_type.replace("_", " ")}
                  </Badge>
                )}
              </div>
              {appointment.reason && (
                <p className="text-sm text-slate-600 mt-2">
                  {appointment.reason}
                </p>
              )}
              {appointment.notes && (
                <p className="text-xs text-slate-500 mt-2 italic">
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between mt-4">
            <div className="grid grid-cols-3 gap-4 text-sm flex-1">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Date
                </p>
                <div className="flex items-center gap-1 text-slate-900 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  {new Date(
                    appointment.appointment_date || appointment.scheduled_date
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Time
                </p>
                <div className="flex items-center gap-1 text-slate-900 font-medium">
                  <Clock className="h-3.5 w-3.5 text-slate-600" />
                  {appointment.start_time?.slice(0, 5)} -{" "}
                  {appointment.end_time?.slice(0, 5)}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Duration
                </p>
                <div className="flex items-center gap-1 text-slate-900 font-medium">
                  <Activity className="h-3.5 w-3.5 text-slate-600" />
                  {appointment.duration_mins} mins
                </div>
              </div>
            </div>

            {(appointment.status === "confirmed" ||
              appointment.status === "pending" ||
              appointment.status === "missing") && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onReschedule(appointment);
                }}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs px-3"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reschedule
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
