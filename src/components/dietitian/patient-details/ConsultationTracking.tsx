"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle2, Stethoscope, Utensils, Dumbbell, FileText, Pill, Activity } from "lucide-react";

interface ConsultationTrackingProps {
  historyCalls: any[];
  upcomingAppointments: any[];
  completedCalls?: any;
  clinicalData?: any;
  dietPlan?: any;
}

export function ConsultationTracking({
  historyCalls,
  upcomingAppointments,
  completedCalls,
  clinicalData,
  dietPlan
}: ConsultationTrackingProps) {
  const [selectedRole, setSelectedRole] = useState<"doctor" | "dietitian" | "fitness">("doctor");
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  // Sample data for demonstration when real data is not available
  const sampleDoctorConsultations = [
    {
      consultation_type: "doctor",
      appointment_date: "2024-06-28",
      notes: "Patient reported improved blood sugar levels. Current HbA1c is 7.2% down from 8.1%. Continue current medication regimen. Monitor fasting glucose levels twice weekly.",
      clinical_notes: "Patient is responding well to Metformin. No adverse effects reported. Recommend continuing current dosage.",
      diagnosis: "Type 2 Diabetes Mellitus - Controlled",
      prescriptions: [
        { name: "Metformin 500mg", dosage: "Twice daily with meals" },
        { name: "Vitamin D3", dosage: "Once daily (1000 IU)" }
      ]
    },
    {
      consultation_type: "doctor",
      appointment_date: "2024-06-15",
      notes: "Initial history call completed. Patient has family history of diabetes. BMI is 28.5. Lifestyle modifications recommended along with medication.",
      clinical_notes: "Patient motivated to make lifestyle changes. Will follow up in 2 weeks.",
      diagnosis: "Type 2 Diabetes Mellitus - Newly Diagnosed",
      prescriptions: [
        { name: "Metformin 500mg", dosage: "Once daily with dinner" }
      ]
    }
  ];

  const sampleDietitianConsultations = [
    {
      consultation_type: "dietitian",
      appointment_date: "2024-06-27",
      notes: "Patient has been following the low-carb diet plan. Weight loss of 2.5kg in the past month. Meal compliance is good. Suggest increasing protein intake to 1.2g per kg body weight.",
      diet_plan: "Low-carb Mediterranean diet with emphasis on whole grains, lean proteins, and vegetables. 3 main meals + 2 snacks. Portion control guidelines provided.",
      patient_stage: "Maintenance Phase - Week 8"
    },
    {
      consultation_type: "dietitian",
      appointment_date: "2024-06-10",
      notes: "Initial dietary assessment completed. Patient consumes high sugar foods. Educated on glycemic index and portion control. Provided meal plan template.",
      diet_plan: "Phase 1: Elimination of refined sugars and processed foods. Introduction of complex carbohydrates. 1500-1800 calories per day.",
      patient_stage: "Initial Phase - Week 2"
    }
  ];

  const sampleFitnessConsultations = [
    {
      consultation_type: "fitness",
      appointment_date: "2024-06-26",
      notes: "Patient has completed 4 weeks of walking program. Now able to walk 30 minutes continuously. Heart rate recovery improved from 3 minutes to 1.5 minutes. Ready to progress to light strength training.",
      fitness_plan: "Week 5-8: Introduction to resistance training 2x/week. Continue walking 5x/week (30-40 mins). Include stretching and mobility work.",
      exercise_notes: "Focus on compound movements. Start with bodyweight exercises. Monitor blood glucose before and after exercise sessions."
    },
    {
      consultation_type: "fitness",
      appointment_date: "2024-06-05",
      notes: "Initial fitness assessment completed. Patient has low activity level. Started with 15-minute daily walks. Blood glucose monitoring before exercise recommended.",
      fitness_plan: "Week 1-4: Walking program starting at 15 mins/day, gradually increasing to 30 mins/day. 5 days/week. Low intensity (40-50% max HR).",
      exercise_notes: "Patient motivated but needs guidance on proper form. Will provide video resources for home exercises."
    }
  ];

  const totalAppointments = (historyCalls?.length || 0) + (upcomingAppointments?.length || 0);
  const historyCallLength = historyCalls?.length + completedCalls?.filter((item: any) => item?.call_type === "history_call")?.length || 0;

  // Filter consultations by role, use sample data if no real data available
  const getConsultationsByRole = (role: string) => {
    const allConsultations = [...(completedCalls || []), ...(historyCalls || [])];
    
    // If no real data, return sample data for demonstration
    if (allConsultations.length === 0) {
      if (role === "doctor") return sampleDoctorConsultations;
      if (role === "dietitian") return sampleDietitianConsultations;
      if (role === "fitness") return sampleFitnessConsultations;
      return [];
    }
    
    // Filter real data by role
    return allConsultations.filter((call: any) => {
      if (role === "doctor") return call.consultation_type === "doctor" || call.call_type === "history_call";
      if (role === "dietitian") return call.consultation_type === "dietitian";
      if (role === "fitness") return call.consultation_type === "fitness";
      return true;
    });
  };

  const roleConsultations = getConsultationsByRole(selectedRole);
  const latestConsultation = roleConsultations[0];

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

        {/* Role Tabs */}
        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as "doctor" | "dietitian" | "fitness")} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="doctor" className="gap-2">
              <Stethoscope className="h-4 w-4" /> Doctor
            </TabsTrigger>
            <TabsTrigger value="dietitian" className="gap-2">
              <Utensils className="h-4 w-4" /> Dietitian
            </TabsTrigger>
            <TabsTrigger value="fitness" className="gap-2">
              <Dumbbell className="h-4 w-4" /> Fitness Coach
            </TabsTrigger>
          </TabsList>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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

          {/* Latest Notes Section */}
          {latestConsultation && (
            <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Latest {selectedRole === "doctor" ? "Doctor" : selectedRole === "dietitian" ? "Dietitian" : "Fitness Coach"} Notes
                </h3>
                <Badge variant="outline" className="text-xs">
                  {new Date(latestConsultation.appointment_date).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {latestConsultation.notes || latestConsultation.clinical_notes || "No notes available from latest consultation."}
              </p>
              {latestConsultation.diagnosis && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-900">Diagnosis: </span>
                  <span className="text-xs text-slate-700">{latestConsultation.diagnosis}</span>
                </div>
              )}
            </div>
          )}

          {/* Consultation History with Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Consultation History</h3>
            {roleConsultations.length > 0 ? (
              roleConsultations.map((consultation: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-all"
                  onClick={() => setSelectedConsultation(consultation === selectedConsultation ? null : consultation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={selectedRole === "doctor" ? "bg-blue-100 text-blue-700" : selectedRole === "dietitian" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}>
                          {selectedRole === "doctor" ? "Doctor" : selectedRole === "dietitian" ? "Dietitian" : "Fitness Coach"}
                        </Badge>
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(consultation.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {consultation.notes && (
                        <p className="text-sm text-slate-600 line-clamp-2">{consultation.notes}</p>
                      )}
                    </div>
                    <Activity className="h-4 w-4 text-slate-400" />
                  </div>

                  {/* Expanded Details */}
                  {selectedConsultation === consultation && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      {consultation.notes && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900">Notes: </span>
                          <p className="text-sm text-slate-700 mt-1">{consultation.notes}</p>
                        </div>
                      )}
                      {selectedRole === "doctor" && consultation.diagnosis && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900">Diagnosis: </span>
                          <p className="text-sm text-slate-700 mt-1">{consultation.diagnosis}</p>
                        </div>
                      )}
                      {selectedRole === "doctor" && consultation.prescriptions && consultation.prescriptions.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                            <Pill className="h-3 w-3" /> Medications: 
                          </span>
                          <div className="mt-2 space-y-1">
                            {consultation.prescriptions.map((med: any, idx: number) => (
                              <div key={idx} className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-200">
                                {med.name} - {med.dosage}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedRole === "dietitian" && consultation.diet_plan && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                            <Utensils className="h-3 w-3" /> Diet Plan: 
                          </span>
                          <p className="text-sm text-slate-700 mt-1">{consultation.diet_plan}</p>
                        </div>
                      )}
                      {selectedRole === "dietitian" && consultation.patient_stage && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900">Patient Stage: </span>
                          <Badge className="ml-2">{consultation.patient_stage}</Badge>
                        </div>
                      )}
                      {selectedRole === "fitness" && consultation.fitness_plan && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" /> Fitness Plan: 
                          </span>
                          <p className="text-sm text-slate-700 mt-1">{consultation.fitness_plan}</p>
                        </div>
                      )}
                      {selectedRole === "fitness" && consultation.exercise_notes && (
                        <div>
                          <span className="text-xs font-semibold text-slate-900">Exercise Notes: </span>
                          <p className="text-sm text-slate-700 mt-1">{consultation.exercise_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No consultations found for this role</p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
