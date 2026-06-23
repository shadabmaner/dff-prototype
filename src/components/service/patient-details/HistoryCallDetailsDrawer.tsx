"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Video, PhoneCall, Phone, Mail } from "lucide-react";

interface HistoryCallDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedHistoryCall: any;
}

export function HistoryCallDetailsDrawer({ open, onOpenChange, selectedHistoryCall }: HistoryCallDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-slate-900">
            Appointment Details
          </SheetTitle>
          <SheetDescription>
            View appointment and consultation information
          </SheetDescription>
        </SheetHeader>

        {selectedHistoryCall && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 capitalize">
                  {selectedHistoryCall.appointment_type}
                </h4>
                <Badge className={`${selectedHistoryCall.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                  selectedHistoryCall.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                  {selectedHistoryCall.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {selectedHistoryCall.mode === 'video' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <PhoneCall className="h-4 w-4" />
                )}
                <span className="capitalize">{selectedHistoryCall.mode} Call</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Staff Information</h4>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Name</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {selectedHistoryCall.staff_first_name} {selectedHistoryCall.staff_last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Role</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedHistoryCall.staff_type}
                  </Badge>
                </div>
                {selectedHistoryCall.staff_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-900">{selectedHistoryCall.staff_phone}</span>
                  </div>
                )}
                {selectedHistoryCall.staff_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-900">{selectedHistoryCall.staff_email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Appointment Details</h4>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(selectedHistoryCall.appointment_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Time</span>
                  <span className="font-semibold text-slate-900">
                    {selectedHistoryCall.start_time} - {selectedHistoryCall.end_time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-900">
                    {selectedHistoryCall.duration_mins} minutes
                  </span>
                </div>
              </div>
            </div>

            {(selectedHistoryCall.reason || selectedHistoryCall.notes) && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Additional Information</h4>
                {selectedHistoryCall.reason && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Reason</p>
                    <p className="text-sm text-slate-900">{selectedHistoryCall.reason}</p>
                  </div>
                )}
                {selectedHistoryCall.notes && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-600 mb-1">Notes</p>
                    <p className="text-sm text-slate-900">{selectedHistoryCall.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
