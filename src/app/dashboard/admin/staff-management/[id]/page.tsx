"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Languages,
  Stethoscope,
  Apple,
  HeartPulse,
  Calendar,
  Award,
  Star,
  Loader2,
  ArrowLeft,
  DollarSign,
  Edit2,
} from "lucide-react";
import { useStaffDetail } from "@/hooks/use-service-api";
import { StaffFormSheet } from "@/components/service/staff-form-sheet";
import type { StaffAppointment, StaffAssignedPatient } from "@/types/service-api";

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (value?: string | null) => {
  if (!value) return "--";
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatDateTime = (date?: string | null, time?: string | null) =>
  `${formatDate(date)} ${time ? `• ${formatTime(time)}` : ""}`.trim();

const getRoleIcon = (staffType: string) => {
  const map: Record<string, ReactNode> = {
    doctor: <Stethoscope className="h-4 w-4" />,
    dietitian: <Apple className="h-4 w-4" />,
    nutritionist: <Apple className="h-4 w-4" />,
    fitness_coach: <HeartPulse className="h-4 w-4" />,
    finance: <DollarSign className="h-4 w-4" />,
  };
  return map[staffType] || <Users className="h-4 w-4" />;
};

const getRoleColor = (staffType: string) => {
  const map: Record<string, string> = {
    doctor: "bg-purple-50 text-purple-700 border-purple-200",
    dietitian: "bg-emerald-50 text-emerald-700 border-emerald-200",
    nutritionist: "bg-emerald-50 text-emerald-700 border-emerald-200",
    fitness_coach: "bg-rose-50 text-rose-700 border-rose-200",
    finance: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return map[staffType] || "bg-muted text-muted-foreground border-border";
};

const appointmentStatusClass = (status?: string | null) => {
  const normalizedStatus = (status || "").toLowerCase();
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    rescheduled: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return map[normalizedStatus] || "bg-muted text-muted-foreground border-border";
};

export default function AdminStaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;
  const [activeTab, setActiveTab] = useState<"patients" | "appointments">("patients");
  const [showEditSheet, setShowEditSheet] = useState(false);

  const { data: staffData, isLoading, error } = useStaffDetail(staffId);

  const staff = staffData?.profile;
  const assignedPatients = staffData?.assigned_patients;
  const appointments = staffData?.appointments;
  const stats = staffData?.stats;
  const assignedPatientCount = stats?.total_assigned_patients ?? assignedPatients?.meta?.total ?? staff?.current_patient_count ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading staff details…</p>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Error loading staff details</h2>
            <p className="text-sm text-muted-foreground">{error?.message || "Staff not found"}</p>
            <Button variant="outline" onClick={() => router.back()} className="mt-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const capacityPercent =
    staff.max_patients && staff.max_patients > 0
      ? Math.round((assignedPatientCount / staff.max_patients) * 100)
      : null;

  const contactItems = [
    staff.email && { icon: <Mail className="h-4 w-4 text-muted-foreground" />, label: "Email", value: staff.email },
    staff.phone && { icon: <Phone className="h-4 w-4 text-muted-foreground" />, label: "Phone", value: staff.phone },
    (staff.address || staff.city || staff.state || staff.country || staff.pincode) && {
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      label: "Address",
      value: [staff.address, staff.city, staff.state, staff.country, staff.pincode].filter(Boolean).join(", "),
    },
    staff.languages?.length && {
      icon: <Languages className="h-4 w-4 text-muted-foreground" />,
      label: "Languages",
      value: staff.languages.join(", "),
    },
  ].filter(Boolean) as { icon: ReactNode; label: string; value: string }[];

  const professionalItems = [
    staff.qualification && { label: "Qualification", value: staff.qualification },
    staff.registration_number && { label: "Registration Number", value: staff.registration_number },
    staff.experience_years != null && { label: "Experience", value: `${staff.experience_years} years` },
    staff.consultation_fee != null && { label: "Consultation Fee", value: `Rs. ${staff.consultation_fee}` },
    staff.bio && { label: "Bio", value: staff.bio },
  ].filter(Boolean) as { label: string; value: string }[];

  const statCards = [
    { label: "Assigned Patients", value: stats?.total_assigned_patients ?? 0 },
    { label: "Total Appointments", value: stats?.total_appointments ?? 0 },
    { label: "Upcoming", value: stats?.upcoming_appointments_count ?? 0 },
    { label: "Completed", value: stats?.completed_appointments_count ?? 0 },
  ];

  const detailedStats = [
    { label: "Total Assigned Patients", value: stats?.total_assigned_patients ?? 0 },
    { label: "Total Appointments", value: stats?.total_appointments ?? 0 },
    { label: "Upcoming", value: stats?.upcoming_appointments_count ?? 0 },
    { label: "Completed", value: stats?.completed_appointments_count ?? 0 },
    { label: "Pending", value: stats?.pending_appointments_count ?? 0 },
    { label: "Cancelled", value: stats?.cancelled_appointments_count ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className=" space-y-8 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/admin/staff-management")}
              className="-ml-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staff List
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold shadow-md">
                {staff.profile_photo_url ? (
                  <img
                    src={staff.profile_photo_url}
                    alt={`${staff.first_name} ${staff.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  `${staff.first_name?.[0] || "S"}${staff.last_name?.[0] || "T"}`
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 capitalize">
                  {staff.first_name} {staff.last_name}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  {getRoleIcon(staff.staff_type)}
                  <span className="text-sm text-slate-600 capitalize">
                    {staff.role_name || staff.staff_type.replace(/_/g, " ")}
                  </span>
                  {staff.specialization && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-600">{staff.specialization}</span>
                    </>
                  )}
                </div>
                {staff.rating != null && (
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-900">{staff.rating.toFixed(1)}</span>
                    <span className="text-sm text-slate-500">({staff.total_reviews ?? 0} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Badge variant="outline" className={`${getRoleColor(staff.staff_type)} px-4 py-2`}>
                {staff.is_available ? "AVAILABLE" : "UNAVAILABLE"}
              </Badge>
              <Button
                onClick={() => setShowEditSheet(true)}
                variant="outline"
                className="mt-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold h-10 px-4 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, idx) => (
            <Card key={s.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{s.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    idx === 0 ? "bg-blue-100" :
                    idx === 1 ? "bg-purple-100" :
                    idx === 2 ? "bg-amber-100" :
                    "bg-emerald-100"
                  }`}>
                    {idx === 0 && <Users className="h-6 w-6 text-blue-600" />}
                    {idx === 1 && <Calendar className="h-6 w-6 text-purple-600" />}
                    {idx === 2 && <Calendar className="h-6 w-6 text-amber-600" />}
                    {idx === 3 && <Calendar className="h-6 w-6 text-emerald-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            {contactItems.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 p-0">
                  {contactItems.map((c) => (
                    <div key={c.label} className="flex items-start gap-4 p-4">
                      <div className="mt-1 rounded-lg bg-slate-100 p-2">{c.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</p>
                        <p className="mt-1 text-sm text-slate-900 break-words">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {professionalItems.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-900">Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 p-0">
                  {professionalItems.map((p) => (
                    <div key={p.label} className="p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{p.label}</p>
                      <p className="mt-1 text-sm text-slate-900">{p.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-900">Patient Load</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Current / Max</p>
                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {assignedPatientCount} <span className="text-xl text-slate-400">/</span> {staff.max_patients ?? "∞"}
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-4">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  {capacityPercent != null && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                        <span>Capacity</span>
                        <span>{capacityPercent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-900">Work Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Joined Date</p>
                      <p className="text-sm font-medium text-slate-900">{formatDate(staff.created_at)}</p>
                    </div>
                  </div>
                  {staff.speciality_name && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2">
                        <Award className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Speciality</p>
                        <p className="text-sm font-medium text-slate-900">{staff.speciality_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {detailedStats.map((s, idx) => (
                    <div key={s.label}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-2 w-2 rounded-full ${
                          idx === 0 ? "bg-blue-500" :
                          idx === 1 ? "bg-purple-500" :
                          idx === 2 ? "bg-amber-500" :
                          idx === 3 ? "bg-emerald-500" :
                          idx === 4 ? "bg-slate-500" :
                          "bg-rose-500"
                        }`} />
                        <p className="text-xs font-medium text-slate-600">{s.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-0">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-base font-semibold text-slate-900">
                Patient Assignments & Schedule
              </CardTitle>
            </div>
            <div className="flex gap-1 -mb-px">
              <button
                onClick={() => setActiveTab("patients")}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "patients"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Assigned Patients</span>
                  {assignedPatients && (
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 ml-1">
                      {assignedPatients.meta?.total || 0}
                    </Badge>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "appointments"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Appointments Schedule</span>
                  {appointments && (
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 ml-1">
                      {appointments.meta?.total || 0}
                    </Badge>
                  )}
                </div>
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "patients" && assignedPatients && (
              <div>
                {assignedPatients.data?.length ? (
                  <>
                    <div className="divide-y divide-slate-100">
                      {assignedPatients.data.map((patient: StaffAssignedPatient) => (
                        <div key={patient.patient_id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                  {patient.first_name[0]}{patient.last_name[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {patient.first_name} {patient.last_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {patient.email || patient.phone || "No contact"}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                  Start: {formatDate(patient.starts_at)}
                                </span>
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                  End: {formatDate(patient.ends_at)}
                                </span>
                                {patient.last_consultation && (
                                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                    Last: {formatDate(patient.last_consultation)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {patient.enrollment_status || "Active"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      Page {assignedPatients.meta.page} of {Math.max(assignedPatients.meta.totalPages, 1)} • Total {assignedPatients.meta.total} patients
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="rounded-full bg-slate-100 p-4">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No assigned patients</p>
                    <p className="text-xs text-slate-500">Patients will appear here when assigned</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "appointments" && appointments && (
              <div>
                {appointments.data?.length ? (
                  <>
                    <div className="divide-y divide-slate-100">
                      {appointments.data.map((appt: StaffAppointment) => (
                        <div key={appt.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                                  <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {appt.patient_name || "Unknown Patient"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatDateTime(appt.appointment_date, appt.start_time)}
                                    {appt.end_time ? ` - ${formatTime(appt.end_time)}` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                  {(appt.mode || "N/A").toUpperCase()}
                                </span>
                                {appt.call_type && (
                                  <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                    {appt.call_type}
                                  </span>
                                )}
                                {appt.appointment_type && (
                                  <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                    {appt.appointment_type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs capitalize ${appointmentStatusClass(appt.status)}`}>
                              {appt.status || "unknown"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      Page {appointments.meta.page} of {Math.max(appointments.meta.totalPages, 1)} • Total {appointments.meta.total} appointments
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="rounded-full bg-slate-100 p-4">
                      <Calendar className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No appointments scheduled</p>
                    <p className="text-xs text-slate-500">Appointments will appear here when scheduled</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StaffFormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        staff={staff}
      />
    </div>
  );
}

